from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager

import time
import logging
import traceback

from preprocessing import clean_text
from feature_extraction import extract_all_features
from model import registry

from risk_scoring import (
    compute_ensemble_score,
    compute_feature_risk_score,
    compute_final_score,
    build_provenance,
    get_risk_level,
    get_confidence,
    generate_recommendations,
    generate_contributing_factors,
    generate_llm_narrative,
)

# =========================================================
# LOGGING
# =========================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================================================
# STARTUP
# =========================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading models...")
    registry.load()
    logger.info("Models loaded successfully")
    yield

# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="Lifestyle Health Risk Prediction API",
    description="Early Warning System for Lifestyle-Related Health Risks",
    version="2.1.0",
    lifespan=lifespan
)

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://lifestyle-health-risk-ews.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# REQUEST / RESPONSE SCHEMAS
# =========================================================

class TextInput(BaseModel):
    text: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Raw lifestyle/health related text"
    )

    # kept for frontend compatibility
    use_sbert: bool = Field(
        default=False,
        description="Disabled in production deployment"
    )


class PredictionResponse(BaseModel):

    risk_level: str
    risk_label: str
    risk_color: str

    ensemble_probability: float
    confidence: float
    final_prediction: int

    text_score: float
    feature_score: float

    model_scores: dict

    extracted_features: dict

    contributing_factors: list
    recommendations: list
    llm_narrative: str

    provenance: dict

    processing_time_ms: float
    disclaimer: str

# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Lifestyle Health Risk Prediction API",
        "version": "2.1.0",
        "docs": "/docs",
        "health": "/health"
    }

# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "models_loaded": registry._loaded,
        "models": {
            "tfidf_lr": "ready",
            "tfidf_rf": "ready",
            "sbert_svm": "disabled_for_demo"
        }
    }

# =========================================================
# MODELS
# =========================================================

@app.get("/models")
def list_models():

    return {
        "available_models": [
            {
                "name": "TF-IDF + Logistic Regression",
                "type": "text",
                "accuracy": 0.9381,
                "f1_score": 0.9382,
                "weight": 0.40
            },
            {
                "name": "TF-IDF + Random Forest",
                "type": "text",
                "accuracy": 0.9045,
                "f1_score": 0.9050,
                "weight": 0.25
            },
            {
                "name": "SBERT + SVM Tuned",
                "type": "semantic",
                "accuracy": 0.9494,
                "f1_score": 0.9494,
                "weight": 0.35,
                "status": "disabled_in_demo"
            }
        ],

        "ensemble_strategy": "weighted_average",
        "optimal_threshold": 0.50,

        "scoring_layers": {
            "text_model_weight": 0.50,
            "feature_model_weight": 0.50,
            "weights_source": "Kaggle SHAP aggregated importance"
        }
    }

# =========================================================
# PREDICT
# =========================================================

@app.post("/predict", response_model=PredictionResponse)
def predict(input_data: TextInput):

    start_time = time.time()

    try:
        # =================================================
        # STEP 1 — VALIDATE
        # =================================================

        raw_text = input_data.text.strip()

        if len(raw_text.split()) < 3:
            raise HTTPException(
                status_code=422,
                detail="Please provide at least 3 words."
            )

        # =================================================
        # STEP 2 — CLEAN
        # =================================================

        cleaned = clean_text(raw_text)

        if not cleaned:
            raise HTTPException(
                status_code=422,
                detail="Input became empty after preprocessing."
            )

        # =================================================
        # STEP 3 — FEATURE EXTRACTION
        # =================================================

        features = extract_all_features(raw_text)

        logger.info(f"Extracted features: {features}")

        # =================================================
        # STEP 4 — MODEL PREDICTIONS
        # =================================================

        tfidf_lr_result = registry.predict_tfidf(cleaned)

        tfidf_rf_result = registry.predict_tfidf_rf(cleaned)

        # SBERT disabled for deployment stability
        sbert_result = None
        sbert_prob = None

        # =================================================
        # STEP 5 — TEXT ENSEMBLE SCORE
        # =================================================

        text_score = compute_ensemble_score(
            prob_tfidf_lr=tfidf_lr_result['prob_high_risk'],
            prob_tfidf_rf=tfidf_rf_result['prob_high_risk'],
            prob_sbert=sbert_prob
        )

        # =================================================
        # STEP 6 — FEATURE RISK SCORE
        # =================================================

        feature_result = compute_feature_risk_score(features)

        logger.info(
            f"Feature Score: {feature_result['feature_score']}"
        )

        # =================================================
        # STEP 7 — FINAL BLENDED SCORE
        # =================================================

        final_score, blend_metadata = compute_final_score(
            text_ensemble_score=text_score,
            feature_score=feature_result['feature_score'],
            features=features
        )

        logger.info(
            f"Final Score: {final_score}"
        )

        # =================================================
        # STEP 8 — RISK LEVEL
        # =================================================

        risk_info = get_risk_level(final_score)

        confidence = get_confidence(final_score)

        # =================================================
        # STEP 9 — EXPLANATIONS
        # =================================================

        recommendations = generate_recommendations(
            features,
            risk_info['level'],
            final_score
        )

        contributing_factors = generate_contributing_factors(
            features,
            tfidf_lr_result['prob_high_risk'],
            tfidf_rf_result['prob_high_risk'],
            sbert_prob
        )

        # =================================================
        # STEP 10 — PROVENANCE
        # =================================================

        provenance = build_provenance(
            feature_result,
            blend_metadata
        )

        # =================================================
        # STEP 11 — OPTIONAL LLM NARRATIVE
        # =================================================

        try:

            llm_narrative = generate_llm_narrative(
                risk_level=risk_info['level'],
                text_score=text_score,
                feature_score=feature_result['feature_score'],
                features=features
            )

        except Exception as e:

            logger.warning(
                f"LLM narrative failed: {e}"
            )

            llm_narrative = (
                "Personalized AI narrative temporarily unavailable."
            )

        # =================================================
        # STEP 12 — RESPONSE
        # =================================================

        processing_time = round(
            (time.time() - start_time) * 1000,
            2
        )

        model_scores = {
            "tfidf_lr": tfidf_lr_result,
            "tfidf_rf": tfidf_rf_result
        }

        return PredictionResponse(

            risk_level=risk_info['level'],
            risk_label=risk_info['label'],
            risk_color=risk_info['color'],

            ensemble_probability=final_score,
            confidence=confidence,

            final_prediction=1 if final_score >= 0.50 else 0,

            text_score=text_score,
            feature_score=feature_result['feature_score'],

            model_scores=model_scores,

            extracted_features=features,

            contributing_factors=contributing_factors,
            recommendations=recommendations,

            llm_narrative=llm_narrative,

            provenance=provenance,

            processing_time_ms=processing_time,

            disclaimer=(
                "This tool is for educational purposes only "
                "and does not constitute medical advice."
            )
        )

    except HTTPException:
        raise

    except Exception as e:

        logger.error(
            f"Prediction Error: {e}",
            exc_info=True
        )

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

# =========================================================
# SAMPLE RESPONSE
# =========================================================

@app.get("/predict/sample")
def sample_prediction():

    return {
        "message": "Sample endpoint active",
        "status": "working"
    }

# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )