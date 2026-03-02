import joblib
import numpy as np
from pathlib import Path

# ── Resolve model directory relative to this file ──
MODEL_DIR = Path(__file__).parent.parent / 'models'


class ModelRegistry:
    """
    Loads and holds all trained models.
    Singleton — instantiated once on app startup.
    """
    def __init__(self):
        self._loaded = False

    def load(self):
        if self._loaded:
            return

        print("📦 Loading models...")

        # Kaggle structured models
        self.xgb_model  = joblib.load(MODEL_DIR / 'kaggle_xgboost.pkl')
        self.rf_tuned   = joblib.load(MODEL_DIR / 'kaggle_random_forest_tuned.pkl')
        self.lr_kaggle  = joblib.load(MODEL_DIR / 'kaggle_logistic_regression.pkl')
        self.scaler     = joblib.load(MODEL_DIR / 'kaggle_scaler.pkl')
        self.label_enc  = joblib.load(MODEL_DIR / 'label_encoders.pkl')

        # TF-IDF text models
        self.tfidf_vec  = joblib.load(MODEL_DIR / 'tfidf_vectorizer.pkl')
        self.lr_tfidf   = joblib.load(MODEL_DIR / 'reddit_tfidf_logistic_regression.pkl')
        self.rf_tfidf   = joblib.load(MODEL_DIR / 'reddit_tfidf_random_forest.pkl')
        self.nb_tfidf   = joblib.load(MODEL_DIR / 'reddit_tfidf_naive_bayes.pkl')

        # SBERT models
        self.svm_tuned  = joblib.load(MODEL_DIR / 'sbert_svm_tuned.pkl')
        self.svm_rbf    = joblib.load(MODEL_DIR / 'sbert_rbf_svm.pkl')

        self._loaded = True
        print("✅ All models loaded successfully!")

    def predict_tfidf(self, cleaned_text: str) -> dict:
        """TF-IDF + LR prediction."""
        X = self.tfidf_vec.transform([cleaned_text])
        prob  = self.lr_tfidf.predict_proba(X)[0]
        return {
            'model'          : 'TF-IDF + Logistic Regression',
            'prob_low_risk'  : round(float(prob[0]), 4),
            'prob_high_risk' : round(float(prob[1]), 4),
            'prediction'     : int(np.argmax(prob))
        }

    def predict_tfidf_rf(self, cleaned_text: str) -> dict:
        """TF-IDF + RF prediction."""
        X = self.tfidf_vec.transform([cleaned_text])
        prob = self.rf_tfidf.predict_proba(X)[0]
        return {
            'model'          : 'TF-IDF + Random Forest',
            'prob_low_risk'  : round(float(prob[0]), 4),
            'prob_high_risk' : round(float(prob[1]), 4),
            'prediction'     : int(np.argmax(prob))
        }

    def predict_sbert(self, embedding: np.ndarray) -> dict:
        """SBERT + SVM Tuned prediction."""
        prob = self.svm_tuned.predict_proba(embedding.reshape(1, -1))[0]
        return {
            'model'          : 'SBERT + SVM Tuned',
            'prob_low_risk'  : round(float(prob[0]), 4),
            'prob_high_risk' : round(float(prob[1]), 4),
            'prediction'     : int(np.argmax(prob))
        }


# ── Global singleton ──
registry = ModelRegistry()