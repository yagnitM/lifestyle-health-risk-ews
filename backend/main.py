from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager
import numpy as np
import time
import logging

from preprocessing import clean_text
from feature_extraction import extract_all_features
from model import registry
from risk_scoring import (
    compute_ensemble_score,
    get_risk_level,
    get_confidence,
    generate_recommendations,
    generate_contributing_factors,
)

# ── Logging ──
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Lifespan: load models on startup ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    registry.load()
    yield

app = FastAPI(
    title       = "Lifestyle Health Risk Prediction API",
    description = "Early Warning System for Lifestyle-Related Health Risks",
    version     = "1.0.0",
    lifespan    = lifespan
)

# ── CORS — allow React rontend ──
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ── Request / Response schemas ──
class TextInput(BaseModel):
    text: str = Field(
        ...,
        min_length  = 10,
        max_length  = 5000,
        description = "Raw text describing health/lifestyle (min 10 chars)"
    )
    use_sbert: bool = Field(
        default     = False,
        description = "Include SBERT model in ensemble (slower, more accurate)"
    )


class PredictionResponse(BaseModel):
    # Core result
    risk_level          : str
    risk_label          : str
    risk_color          : str
    ensemble_probability: float
    confidence          : float
    final_prediction    : int   # 0 = low, 1 = high

    # Individual model scores
    model_scores: dict

    # Extracted features
    extracted_features: dict

    # Explanation
    contributing_factors: list
    recommendations     : list

    # Meta
    processing_time_ms  : float
    disclaimer          : str


# ── Endpoints ──

@app.get("/")
def root():
    return {
        "message" : "Lifestyle Health Risk Prediction API",
        "version" : "1.0.0",
        "docs"    : "/docs",
        "health"  : "/health"
    }


@app.get("/health")
def health_check():
    return {
        "status"        : "healthy",
        "models_loaded" : registry._loaded,
        "models"        : {
            "tfidf_lr" : "ready",
            "tfidf_rf" : "ready",
            "sbert_svm": "ready"
        }
    }


@app.get("/models")
def list_models():
    return {
        "available_models": [
            {
                "name"     : "TF-IDF + Logistic Regression",
                "type"     : "text",
                "accuracy" : 0.9381,
                "f1_score" : 0.9382,
                "weight"   : 0.40
            },
            {
                "name"     : "TF-IDF + Random Forest",
                "type"     : "text",
                "accuracy" : 0.9045,
                "f1_score" : 0.9050,
                "weight"   : 0.25
            },
            {
                "name"     : "SBERT + SVM Tuned",
                "type"     : "semantic",
                "accuracy" : 0.9494,
                "f1_score" : 0.9494,
                "weight"   : 0.35
            }
        ],
        "ensemble_strategy": "weighted_average",
        "optimal_threshold": 0.50
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(input_data: TextInput):
    start_time = time.time()

    try:
        # ── Step 1: Validate ──
        raw_text = input_data.text.strip()
        if len(raw_text.split()) < 3:
            raise HTTPException(
                status_code=422,
                detail="Text too short. Please provide at least 3 words."
            )

        # ── Step 2: Preprocess ──
        cleaned = clean_text(raw_text)
        if not cleaned:
            raise HTTPException(
                status_code=422,
                detail="Text became empty after cleaning. Please provide meaningful text."
            )

        # ── Step 3: Extract features ──
        features = extract_all_features(raw_text)  # use raw for feature extraction
        logger.info(f"Features extracted: {features}")

        # ── Step 4: Model predictions ──
        tfidf_lr_result = registry.predict_tfidf(cleaned)
        tfidf_rf_result = registry.predict_tfidf_rf(cleaned)

        sbert_result    = None
        sbert_prob      = None

        if input_data.use_sbert:
            try:
                from sentence_transformers import SentenceTransformer
                sbert_encoder = SentenceTransformer('all-MiniLM-L6-v2')
                embedding     = sbert_encoder.encode(
                    [cleaned], normalize_embeddings=True
                )
                sbert_result  = registry.predict_sbert(embedding[0])
                sbert_prob    = sbert_result['prob_high_risk']
            except Exception as e:
                logger.warning(f"SBERT prediction failed: {e}. Using TF-IDF only.")

        # ── Step 5: Ensemble ──
        ensemble_prob = compute_ensemble_score(
            prob_tfidf_lr = tfidf_lr_result['prob_high_risk'],
            prob_tfidf_rf = tfidf_rf_result['prob_high_risk'],
            prob_sbert    = sbert_prob
        )

        # ── Step 6: Risk level + confidence ──
        risk_info  = get_risk_level(ensemble_prob)
        confidence = get_confidence(ensemble_prob)

        # ── Step 7: Recommendations + contributing factors ──
        recommendations = generate_recommendations(
            features, risk_info['level'], ensemble_prob
        )
        contributing_factors = generate_contributing_factors(
            features,
            tfidf_lr_result['prob_high_risk'],
            tfidf_rf_result['prob_high_risk'],
            sbert_prob
        )

        # ── Step 8: Build response ──
        processing_time = round((time.time() - start_time) * 1000, 2)

        model_scores = {
            'tfidf_lr' : tfidf_lr_result,
            'tfidf_rf' : tfidf_rf_result,
        }
        if sbert_result:
            model_scores['sbert'] = sbert_result

        return PredictionResponse(
            risk_level           = risk_info['level'],
            risk_label           = risk_info['label'],
            risk_color           = risk_info['color'],
            ensemble_probability = ensemble_prob,
            confidence           = confidence,
            final_prediction     = 1 if ensemble_prob >= 0.50 else 0,
            model_scores         = model_scores,
            extracted_features   = features,
            contributing_factors = contributing_factors,
            recommendations      = recommendations,
            processing_time_ms   = processing_time,
            disclaimer           = (
                "This tool is for educational purposes only and does not "
                "constitute medical advice. Consult a healthcare professional "
                "for any health concerns."
            )
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/predict/sample")
def sample_prediction():
    """Returns a sample prediction for frontend testing without real input."""
    return {
        "risk_level"           : "HIGH",
        "risk_label"           : "High Risk",
        "risk_color"           : "#e74c3c",
        "ensemble_probability" : 0.82,
        "confidence"           : 0.64,
        "final_prediction"     : 1,
        "model_scores": {
            "tfidf_lr": {"prob_high_risk": 0.85, "prob_low_risk": 0.15},
            "tfidf_rf": {"prob_high_risk": 0.76, "prob_low_risk": 0.24}
        },
        "extracted_features": {
            "sleep_hours"     : 4.0,
            "smoking_detected": 1,
            "alcohol_detected": 1,
            "stress_score"    : 0.72,
            "diet_quality"    : 2
        },
        "contributing_factors": [
            {"factor": "Poor Sleep",    "impact": "high",   "direction": "risk_increasing"},
            {"factor": "Smoking",       "impact": "high",   "direction": "risk_increasing"},
            {"factor": "High Stress",   "impact": "high",   "direction": "risk_increasing"}
        ],
        "recommendations": [
            "⚠️ You mentioned ~4 hours of sleep. Aim for 7-9 hours per night.",
            "🚬 Quitting smoking significantly reduces cardiovascular risk.",
            "🧠 High stress detected. Consider mindfulness or therapy."
        ],
        "processing_time_ms": 142.5,
        "disclaimer": "Educational purposes only. Not medical advice."
    }