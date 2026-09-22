import os
import joblib
import pandas as pd
from typing import Dict, Any
from datetime import datetime

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "price_model.joblib")

class PricePredictor:
    def __init__(self):
        self.model = None
        self.is_trained = False
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.is_trained = True
                print(f"[PricePredictor] Successfully loaded model from {MODEL_PATH}")
            except Exception as e:
                print(f"[PricePredictor] Failed to load model: {e}")
        else:
            print("[PricePredictor] Warning: Model file not found.")

    def predict(self, crop: str, state: str, district: str) -> Dict[str, Any]:
        if not self.is_trained or not self.model:
            # Fallback logic
            return {
                "crop": crop,
                "state": state,
                "district": district,
                "predicted_price_rs_per_kg": 25.0,
                "confidence": 0.5,
                "note": "Fallback prediction (Model not loaded)"
            }

        input_df = pd.DataFrame([{
            'State': state,
            'District': district,
            'Crops': crop
        }])

        try:
            pred_price = self.model.predict(input_df)[0]
            # Get probabilities if available? RandomForestRegressor gives float.
            return {
                "crop": crop,
                "state": state,
                "district": district,
                "predicted_price_rs_per_kg": round(float(pred_price), 2),
                "confidence": 0.85,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"[PricePredictor] Prediction Error: {e}")
            return {
                "crop": crop,
                "state": state,
                "district": district,
                "predicted_price_rs_per_kg": 25.0,
                "confidence": 0.5,
                "note": f"Error during prediction: {e}"
            }

price_predictor = PricePredictor()
