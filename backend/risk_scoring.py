import numpy as np
from typing import Optional


# ── Ensemble weights (TF-IDF LR : TF-IDF RF : SBERT) ──
WEIGHTS = {
    'tfidf_lr' : 0.40,
    'tfidf_rf' : 0.25,
    'sbert'    : 0.35,
}

OPTIMAL_THRESHOLD = 0.50  # from Notebook 5 threshold analysis


def compute_ensemble_score(
    prob_tfidf_lr : float,
    prob_tfidf_rf : float,
    prob_sbert    : Optional[float] = None
) -> float:
    """
    Weighted ensemble of model probabilities.
    If SBERT unavailable, redistributes weight to TF-IDF models.
    """
    if prob_sbert is not None:
        score = (
            WEIGHTS['tfidf_lr'] * prob_tfidf_lr +
            WEIGHTS['tfidf_rf'] * prob_tfidf_rf +
            WEIGHTS['sbert']    * prob_sbert
        )
    else:
        # Redistribute SBERT weight proportionally
        w_lr = WEIGHTS['tfidf_lr'] / (WEIGHTS['tfidf_lr'] + WEIGHTS['tfidf_rf'])
        w_rf = WEIGHTS['tfidf_rf'] / (WEIGHTS['tfidf_lr'] + WEIGHTS['tfidf_rf'])
        score = w_lr * prob_tfidf_lr + w_rf * prob_tfidf_rf

    return round(float(score), 4)


def get_risk_level(ensemble_prob: float) -> dict:
    """
    Maps ensemble probability to risk level + label.
    """
    if ensemble_prob >= 0.75:
        return {'level': 'HIGH',   'label': 'High Risk',   'color': '#e74c3c'}
    elif ensemble_prob >= 0.50:
        return {'level': 'MEDIUM', 'label': 'Medium Risk', 'color': '#f39c12'}
    elif ensemble_prob >= 0.25:
        return {'level': 'LOW',    'label': 'Low Risk',    'color': '#2ecc71'}
    else:
        return {'level': 'VERY_LOW', 'label': 'Very Low Risk', 'color': '#27ae60'}


def get_confidence(ensemble_prob: float) -> float:
    """Distance from decision boundary, scaled to 0-1."""
    return round(abs(ensemble_prob - OPTIMAL_THRESHOLD) * 2, 4)


def generate_recommendations(
    features      : dict,
    risk_level    : str,
    ensemble_prob : float
) -> list[str]:
    """
    Rule-based recommendations from extracted features.
    """
    recs = []

    # Sleep
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

    # Smoking
    if features.get('smoking_detected'):
        recs.append(
            "🚬 Smoking detected in your text. "
            "Quitting smoking significantly reduces cardiovascular and cancer risk."
        )

    # Alcohol
    if features.get('alcohol_detected'):
        recs.append(
            "🍺 Alcohol use mentioned. "
            "Limit to recommended guidelines (≤14 units/week)."
        )

    # Stress
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

    # Diet
    diet = features.get('diet_quality', 1)
    if diet == 2:
        recs.append(
            "🍔 High sugar/unhealthy diet indicators found. "
            "Consider reducing processed foods and increasing vegetables."
        )

    # Exercise
    exercise = features.get('exercise_level', 1)
    if exercise == 0:
        recs.append(
            "🏃 No exercise activity detected. "
            "Even 30 minutes of walking daily reduces health risk significantly."
        )

    # High risk general
    if risk_level == 'HIGH' and len(recs) == 0:
        recs.append(
            "⚕️ High risk indicators detected. "
            "Consider consulting a healthcare professional for a full assessment."
        )

    # Low risk positive reinforcement
    if risk_level in ('LOW', 'VERY_LOW') and len(recs) == 0:
        recs.append(
            "✅ Your text suggests healthy lifestyle habits. "
            "Keep maintaining your current routine!"
        )

    return recs


def generate_contributing_factors(
    features      : dict,
    tfidf_lr_prob : float,
    tfidf_rf_prob : float,
    sbert_prob    : Optional[float]
) -> list[dict]:
    """
    Top factors contributing to the risk score for frontend display.
    """
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
            'detail'   : f'Exercise level: {features.get("exercise_label","medium")}',
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