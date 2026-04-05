import numpy as np
from typing import Optional
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
client = Groq(api_key=os.getenv("GROQ_API_KEY"))



# ── Ensemble weights (TF-IDF LR : TF-IDF RF : SBERT) ──
WEIGHTS = {
    'tfidf_lr' : 0.40,
    'tfidf_rf' : 0.25,
    'sbert'    : 0.35,
}

OPTIMAL_THRESHOLD = 0.50  # from Notebook 5 threshold analysis

# ── Feature-based clinical score weights ──
# Derived from Notebook 5 Cell 16 — Kaggle SHAP aggregated importance
# bmi/lifestyle_score → mapped to exercise/diet proxies
# Top 6 features normalized to sum to 1.0
CLINICAL_WEIGHTS = {
    'smoking'  : 0.28,   # smoking_encoded SHAP rank 1 in LR
    'sleep'    : 0.24,   # sleep / sleep_quality SHAP rank 2
    'stress'   : 0.20,   # lifestyle_score + substance_use proxy
    'alcohol'  : 0.14,   # alcohol_encoded SHAP confirmed
    'diet'     : 0.08,   # sugar_intake_encoded SHAP rank 4
    'exercise' : 0.06,   # exercise_encoded SHAP rank 5
}

# ── Final score blend ──
# 50% text model (linguistic risk signature)
# 50% feature model (clinical feature grounding)
TEXT_WEIGHT    = 0.50
FEATURE_WEIGHT = 0.50


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1 — Existing ensemble (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

def compute_ensemble_score(
    prob_tfidf_lr : float,
    prob_tfidf_rf : float,
    prob_sbert    : Optional[float] = None
) -> float:
    """
    Weighted ensemble of text model probabilities.
    If SBERT unavailable, redistributes weight to TF-IDF models.
    """
    if prob_sbert is not None:
        score = (
            WEIGHTS['tfidf_lr'] * prob_tfidf_lr +
            WEIGHTS['tfidf_rf'] * prob_tfidf_rf +
            WEIGHTS['sbert']    * prob_sbert
        )
    else:
        w_lr = WEIGHTS['tfidf_lr'] / (WEIGHTS['tfidf_lr'] + WEIGHTS['tfidf_rf'])
        w_rf = WEIGHTS['tfidf_rf'] / (WEIGHTS['tfidf_lr'] + WEIGHTS['tfidf_rf'])
        score = w_lr * prob_tfidf_lr + w_rf * prob_tfidf_rf

    return round(float(score), 4)


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2 — Feature-based clinical risk score (NEW)
# ─────────────────────────────────────────────────────────────────────────────

def compute_feature_risk_score(features: dict) -> dict:
    """
    Computes a clinical risk score purely from extracted lifestyle features.
    Weights sourced from Kaggle SHAP aggregated importance (Notebook 5, Cell 16).
    
    Returns score (0-1), component breakdown, extraction coverage, and rules fired.
    This score grounds the final output in named clinical constructs rather than
    linguistic category similarity alone.
    """
    sleep    = features.get('sleep_hours',    7.0)
    smoking  = features.get('smoking_detected', False)
    alcohol  = features.get('alcohol_detected', False)
    stress   = features.get('stress_score',    0.0)
    diet     = features.get('diet_quality',    1)
    exercise = features.get('exercise_level',  1)

    # ── Track which features were actually extracted vs defaulted ──
    extraction_coverage = {
        'sleep_hours'      : sleep    != 7.0,   # 7.0 is the default
        'smoking_detected' : True,               # boolean always set
        'alcohol_detected' : True,               # boolean always set
        'stress_score'     : stress   != 0.0,   # 0.0 is the default
        'diet_quality'     : diet     != 1,     # 1 is neutral default
        'exercise_level'   : exercise != 1,     # 1 is neutral default
    }
    features_extracted = sum(extraction_coverage.values())
    extraction_confidence = (
        'high'   if features_extracted >= 5 else
        'medium' if features_extracted >= 3 else
        'low'
    )

    # ── Score each component 0-1 against clinical thresholds ──
    # Sleep: linear risk increase below 7h, capped at 1.0 below 3h
    sleep_risk = round(max(0.0, min(1.0, (7.0 - sleep) / 4.0)), 4)

    # Smoking: binary with high weight — near-certainty of risk signal
    smoking_risk = 0.90 if smoking else 0.0

    # Alcohol: binary moderate risk
    alcohol_risk = 0.60 if alcohol else 0.0

    # Stress: already 0-1 from extractor, use directly
    stress_risk = round(min(1.0, stress), 4)

    # Diet: categorical — poor=0.70, neutral=0.20, healthy=0.0
    diet_risk = {0: 0.0, 1: 0.20, 2: 0.70}.get(diet, 0.20)

    # Exercise: categorical — none=0.60, low=0.30, medium=0.10, high=0.0
    exercise_risk = {0: 0.60, 1: 0.30, 2: 0.10, 3: 0.0}.get(exercise, 0.30)

    # ── Weighted combination using SHAP-derived weights ──
    components = {
        'smoking'  : smoking_risk,
        'sleep'    : sleep_risk,
        'stress'   : stress_risk,
        'alcohol'  : alcohol_risk,
        'diet'     : diet_risk,
        'exercise' : exercise_risk,
    }

    feature_score = sum(
        CLINICAL_WEIGHTS[k] * v for k, v in components.items()
    )
    feature_score = round(float(feature_score), 4)

    # ── Rules fired — human readable, for provenance output ──
    rules_fired = []
    if smoking:
        contrib = round(CLINICAL_WEIGHTS['smoking'] * smoking_risk, 4)
        rules_fired.append({
            'rule'        : 'smoking_detected = True',
            'contribution': f'+{contrib}',
            'rationale'   : 'Nicotine use — highest individual risk weight per SHAP'
        })
    if sleep < 7:
        contrib = round(CLINICAL_WEIGHTS['sleep'] * sleep_risk, 4)
        rules_fired.append({
            'rule'        : f'sleep_hours = {sleep} (below 7h threshold)',
            'contribution': f'+{contrib}',
            'rationale'   : f'{sleep}h detected — each hour below 7h linearly increases risk'
        })
    if stress > 0.40:
        contrib = round(CLINICAL_WEIGHTS['stress'] * stress_risk, 4)
        rules_fired.append({
            'rule'        : f'stress_score = {round(stress, 2)} (above 0.40 threshold)',
            'contribution': f'+{contrib}',
            'rationale'   : 'Elevated psychological stress load detected'
        })
    if alcohol:
        contrib = round(CLINICAL_WEIGHTS['alcohol'] * alcohol_risk, 4)
        rules_fired.append({
            'rule'        : 'alcohol_detected = True',
            'contribution': f'+{contrib}',
            'rationale'   : 'Alcohol use keywords detected'
        })
    if diet == 2:
        contrib = round(CLINICAL_WEIGHTS['diet'] * diet_risk, 4)
        rules_fired.append({
            'rule'        : 'diet_quality = poor',
            'contribution': f'+{contrib}',
            'rationale'   : 'Unhealthy dietary pattern keywords detected'
        })
    if exercise == 0:
        contrib = round(CLINICAL_WEIGHTS['exercise'] * exercise_risk, 4)
        rules_fired.append({
            'rule'        : 'exercise_level = none',
            'contribution': f'+{contrib}',
            'rationale'   : 'No physical activity signals detected'
        })

    return {
        'feature_score'        : feature_score,
        'components'           : components,
        'extraction_coverage'  : extraction_coverage,
        'extraction_confidence': extraction_confidence,
        'features_extracted'   : features_extracted,
        'rules_fired'          : rules_fired,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3 — Behavioral override layer (NEW)
# ─────────────────────────────────────────────────────────────────────────────

def apply_behavioral_override(
    score    : float,
    features : dict
) -> tuple[float, list[str]]:
    """
    When multiple concurrent high-risk behavioral signals are detected,
    applies a conservative floor to the final score.

    Rationale: Co-occurring risk factors carry compounded risk that exceeds
    the sum of individual contributions. This is consistent with multi-morbidity
    frameworks in clinical literature (e.g., cardiovascular + metabolic + 
    psychological risk acting simultaneously).

    Returns adjusted score and list of override reasons applied.
    """
    sleep   = features.get('sleep_hours',    7.0)
    smoking = features.get('smoking_detected', False)
    alcohol = features.get('alcohol_detected', False)
    stress  = features.get('stress_score',    0.0)

    overrides_applied = []

    # Count concurrent high-risk signals
    risk_signals = 0
    if smoking:              risk_signals += 1
    if alcohol:              risk_signals += 1
    if sleep < 5:            risk_signals += 1
    elif sleep < 6:          risk_signals += 0.5
    if stress > 0.60:        risk_signals += 1
    elif stress > 0.40:      risk_signals += 0.5

    risk_signals = round(risk_signals)

    # Two concurrent signals — floor at MEDIUM range
    if risk_signals >= 2 and score < 0.55:
        score = 0.55
        overrides_applied.append(
            f'{risk_signals} concurrent behavioral risk signals detected — '
            'conservative floor applied (multi-morbidity compounding)'
        )

    # Three or more concurrent signals — floor at HIGH range
    if risk_signals >= 3 and score < 0.75:
        score = 0.75
        overrides_applied.append(
            f'{risk_signals} concurrent behavioral risk signals detected — '
            'high-risk floor applied (compounded cardiovascular/metabolic risk)'
        )

    return round(score, 4), overrides_applied


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4 — Final blended score (NEW)
# ─────────────────────────────────────────────────────────────────────────────

def compute_final_score(
    text_ensemble_score : float,
    feature_score       : float,
    features            : dict,
) -> tuple[float, dict]:
    """
    Blends text model score with feature-based clinical score.
    Then applies behavioral override if concurrent signals warrant it.

    TEXT_WEIGHT    = 0.50  (linguistic risk signature)
    FEATURE_WEIGHT = 0.50  (clinical feature grounding)

    Returns final score and blend metadata.
    """
    blended = round(
        TEXT_WEIGHT    * text_ensemble_score +
        FEATURE_WEIGHT * feature_score,
        4
    )

    blended, overrides = apply_behavioral_override(blended, features)

    blend_metadata = {
        'text_score'           : text_ensemble_score,
        'feature_score'        : feature_score,
        'text_weight'          : TEXT_WEIGHT,
        'feature_weight'       : FEATURE_WEIGHT,
        'pre_override_score'   : round(
            TEXT_WEIGHT * text_ensemble_score +
            FEATURE_WEIGHT * feature_score, 4
        ),
        'overrides_applied'    : overrides,
        'final_score'          : blended,
    }

    return blended, blend_metadata


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5 — Provenance builder (NEW)
# ─────────────────────────────────────────────────────────────────────────────

def build_provenance(
    feature_result : dict,
    blend_metadata : dict,
) -> dict:
    """
    Builds the provenance object attached to every API response.
    Shows exactly how the score was derived — which features were found,
    which rules fired, what each contributed, and where uncertainty exists.

    This is the 'show your working' layer. Examiners open this.
    Users can trust the output because the derivation is transparent.
    """
    coverage = feature_result['extraction_coverage']
    conf     = feature_result['extraction_confidence']

    low_confidence_reason = None
    if conf == 'low':
        missing = [k for k, v in coverage.items() if not v]
        low_confidence_reason = (
            f"Only {feature_result['features_extracted']}/6 features extracted. "
            f"Missing: {', '.join(missing)}. "
            "Feature score less reliable — provide more lifestyle detail for better accuracy."
        )
    elif conf == 'medium':
        missing = [k for k, v in coverage.items() if not v]
        if missing:
            low_confidence_reason = (
                f"Some features defaulted: {', '.join(missing)}. "
                "Score is indicative — more detail improves accuracy."
            )

    return {
        'scoring_method': {
            'text_model'    : f"3-model ensemble (TF-IDF LR {int(WEIGHTS['tfidf_lr']*100)}% · "
                              f"TF-IDF RF {int(WEIGHTS['tfidf_rf']*100)}% · "
                              f"SBERT SVM {int(WEIGHTS['sbert']*100)}%)",
            'feature_model' : 'Clinical feature scoring — weights from Kaggle SHAP analysis (Notebook 5)',
            'final_blend'   : f"Text {int(TEXT_WEIGHT*100)}% · Feature {int(FEATURE_WEIGHT*100)}%",
        },
        'score_breakdown': {
            'text_model_score'   : blend_metadata['text_score'],
            'feature_model_score': blend_metadata['feature_score'],
            'pre_override'       : blend_metadata['pre_override_score'],
            'overrides_applied'  : blend_metadata['overrides_applied'],
            'final_score'        : blend_metadata['final_score'],
        },
        'extraction_coverage'  : coverage,
        'extraction_confidence': conf,
        'features_extracted'   : f"{feature_result['features_extracted']}/6",
        'rules_fired'          : feature_result['rules_fired'],
        'low_confidence_reason': low_confidence_reason,
        'clinical_weights_source': 'Kaggle XGBoost + RF SHAP aggregated importance — Notebook 5, Cell 16',
    }


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6 — Risk level + confidence (unchanged logic, now uses final score)
# ─────────────────────────────────────────────────────────────────────────────

def get_risk_level(ensemble_prob: float) -> dict:
    """Maps final probability to risk level + label."""
    if ensemble_prob >= 0.75:
        return {'level': 'HIGH',     'label': 'High Risk',      'color': '#e74c3c'}
    elif ensemble_prob >= 0.50:
        return {'level': 'MEDIUM',   'label': 'Medium Risk',    'color': '#f39c12'}
    elif ensemble_prob >= 0.25:
        return {'level': 'LOW',      'label': 'Low Risk',       'color': '#2ecc71'}
    else:
        return {'level': 'VERY_LOW', 'label': 'Very Low Risk',  'color': '#27ae60'}


def get_confidence(ensemble_prob: float) -> float:
    """Distance from decision boundary, scaled to 0-1."""
    return round(abs(ensemble_prob - OPTIMAL_THRESHOLD) * 2, 4)


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7 — Recommendations (existing, unchanged)
# ─────────────────────────────────────────────────────────────────────────────

def generate_recommendations(
    features      : dict,
    risk_level    : str,
    ensemble_prob : float
) -> list[str]:
    """Rule-based recommendations from extracted features."""
    recs = []

    sleep = features.get('sleep_hours', 7.0)
    if sleep < 6:
        recs.append(
            f"⚠️ You mentioned ~{sleep} hours of sleep. "
            "Aim for 7-9 hours per night to reduce health risk."
        )
    elif sleep > 9:
        recs.append(
            "ℹ️ Excessive sleep (>9 hours) can sometimes indicate "
            "underlying health issues. Consider consulting a doctor."
        )

    if features.get('smoking_detected'):
        recs.append(
            "🚬 Smoking detected in your text. "
            "Quitting smoking significantly reduces cardiovascular and cancer risk."
        )

    if features.get('alcohol_detected'):
        recs.append(
            "🍺 Alcohol use mentioned. "
            "Limit to recommended guidelines (≤14 units/week)."
        )

    stress = features.get('stress_score', 0)
    if stress > 0.5:
        recs.append(
            "🧠 High stress indicators detected. "
            "Consider mindfulness, therapy, or stress management techniques."
        )
    elif stress > 0.25:
        recs.append(
            "💭 Moderate stress detected. "
            "Regular exercise and adequate sleep can help manage stress levels."
        )

    diet = features.get('diet_quality', 1)
    if diet == 2:
        recs.append(
            "🍔 High sugar/unhealthy diet indicators found. "
            "Consider reducing processed foods and increasing vegetables."
        )

    exercise = features.get('exercise_level', 1)
    if exercise == 0:
        recs.append(
            "🏃 No exercise activity detected. "
            "Even 30 minutes of walking daily reduces health risk significantly."
        )

    if risk_level == 'HIGH' and len(recs) == 0:
        recs.append(
            "⚕️ High risk indicators detected. "
            "Consider consulting a healthcare professional for a full assessment."
        )

    if risk_level in ('LOW', 'VERY_LOW') and len(recs) == 0:
        recs.append(
            "✅ Your text suggests healthy lifestyle habits. "
            "Keep maintaining your current routine!"
        )

    return recs


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 8 — Contributing factors (existing, unchanged)
# ─────────────────────────────────────────────────────────────────────────────

def generate_contributing_factors(
    features      : dict,
    tfidf_lr_prob : float,
    tfidf_rf_prob : float,
    sbert_prob    : Optional[float]
) -> list[dict]:
    """Top factors contributing to the risk score for frontend display."""
    factors = []

    sleep = features.get('sleep_hours', 7.0)
    if sleep < 6:
        factors.append({
            'factor'   : 'Poor Sleep',
            'detail'   : f'{sleep} hours/night detected',
            'impact'   : 'high',
            'direction': 'risk_increasing'
        })
    elif sleep >= 7:
        factors.append({
            'factor'   : 'Good Sleep',
            'detail'   : f'{sleep} hours/night detected',
            'impact'   : 'medium',
            'direction': 'risk_decreasing'
        })

    if features.get('smoking_detected'):
        factors.append({
            'factor'   : 'Smoking',
            'detail'   : 'Smoking keywords detected',
            'impact'   : 'high',
            'direction': 'risk_increasing'
        })

    if features.get('alcohol_detected'):
        factors.append({
            'factor'   : 'Alcohol Use',
            'detail'   : 'Alcohol keywords detected',
            'impact'   : 'medium',
            'direction': 'risk_increasing'
        })

    stress = features.get('stress_score', 0)
    if stress > 0.3:
        factors.append({
            'factor'   : 'Stress / Mental Health',
            'detail'   : f'Stress score: {stress:.2f}',
            'impact'   : 'high' if stress > 0.6 else 'medium',
            'direction': 'risk_increasing'
        })

    diet = features.get('diet_quality', 1)
    if diet == 0:
        factors.append({
            'factor'   : 'Healthy Diet',
            'detail'   : 'Healthy eating keywords detected',
            'impact'   : 'medium',
            'direction': 'risk_decreasing'
        })
    elif diet == 2:
        factors.append({
            'factor'   : 'Unhealthy Diet',
            'detail'   : 'High sugar/junk food keywords detected',
            'impact'   : 'medium',
            'direction': 'risk_increasing'
        })

    exercise = features.get('exercise_level', 1)
    if exercise >= 2:
        factors.append({
            'factor'   : 'Active Lifestyle',
            'detail'   : f'Exercise level: {features.get("exercise_label", "medium")}',
            'impact'   : 'medium',
            'direction': 'risk_decreasing'
        })
    elif exercise == 0:
        factors.append({
            'factor'   : 'Sedentary Lifestyle',
            'detail'   : 'No exercise detected',
            'impact'   : 'medium',
            'direction': 'risk_increasing'
        })

    return factors

# ─────────────────────────────────────────────────────────────────────────────
# SECTION 9 — LLM Narrative (Grok)
# ─────────────────────────────────────────────────────────────────────────────

def generate_llm_narrative(risk_level, text_score, feature_score, features):
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # free, fast
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": f"""You are a lifestyle health risk assistant.
- Risk Level: {risk_level}
- Text Score: {text_score}
- Feature Score: {feature_score}
- Smoking: {features.get('smoking_detected')}
- Alcohol: {features.get('alcohol_detected')}
- Sleep: {features.get('sleep_hours')}
- Stress: {features.get('stress_score')}

Write 2-3 simple sentences explaining the user's lifestyle risk. Do NOT diagnose diseases. Be clear and practical."""
            }]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"GROQ ERROR: {type(e).__name__}: {e}")
        return None