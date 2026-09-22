import os
import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional, List

class CropYieldPredictor:
    def __init__(self):
        self.model = None
        self.metrics = None
        self.supported_crops = []
        self.supported_seasons = []
        self.supported_states = []
        self.crop_lookup = {}
        self.state_lookup = {}
        self.season_lookup = {}
        self.model_loaded = False
        self._load_artifacts()

    def _load_artifacts(self):
        base_dir = os.path.dirname(__file__)
        model_path = os.path.join(base_dir, "models", "crop_yield_model.pkl")
        metrics_path = os.path.join(base_dir, "models", "training_metrics.json")

        # Fallback to ml/models if not found in ai-service/models
        if not os.path.exists(model_path):
            model_path = os.path.join(base_dir, "..", "ml", "models", "crop_yield_model.pkl")
            metrics_path = os.path.join(base_dir, "..", "ml", "models", "training_metrics.json")

        # Check for split parts and recombine if needed
        part1 = model_path + ".part1"
        part2 = model_path + ".part2"
        if not os.path.exists(model_path) and os.path.exists(part1) and os.path.exists(part2):
            print(f"[AI-SERVICE] Recombining split model from {part1} and {part2}...")
            with open(model_path, 'wb') as outfile:
                with open(part1, 'rb') as f1:
                    outfile.write(f1.read())
                with open(part2, 'rb') as f2:
                    outfile.write(f2.read())
            print(f"[AI-SERVICE] Successfully recombined {model_path}")

        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.model_loaded = True
                print(f"[AI-SERVICE] Crop Yield Model successfully loaded from {model_path}")
            except Exception as e:
                print(f"[AI-SERVICE ERROR] Failed to load model from {model_path}: {e}")

        if os.path.exists(metrics_path):
            try:
                with open(metrics_path, "r", encoding="utf-8") as f:
                    self.metrics = json.load(f)
                    self.supported_crops = self.metrics.get("supported_crops", [])
                    self.supported_seasons = self.metrics.get("supported_seasons", [])
                    self.supported_states = self.metrics.get("supported_states", [])

                    # Case-insensitive mapping lookups
                    self.crop_lookup = {c.lower(): c for c in self.supported_crops}
                    self.state_lookup = {s.lower(): s for s in self.supported_states}
                    self.season_lookup = {sn.lower(): sn for sn in self.supported_seasons}
                print(f"[AI-SERVICE] Training metrics loaded ({len(self.supported_crops)} crops, {len(self.supported_states)} states).")
            except Exception as e:
                print(f"[AI-SERVICE ERROR] Failed to load metrics from {metrics_path}: {e}")

    def validate_inputs(
        self,
        crop: str,
        season: str,
        state: str,
        area: float,
        annual_rainfall: float,
        fertilizer: float,
        pesticide: float,
        crop_year: Optional[int] = None
    ) -> Dict[str, Any]:
        """Validate input parameters against domain requirements and training vocabulary."""
        errors: List[str] = []

        if not crop or not str(crop).strip():
            errors.append("Crop is mandatory.")
        if not season or not str(season).strip():
            errors.append("Season is mandatory.")
        if not state or not str(state).strip():
            errors.append("State is mandatory.")

        if area is None or area <= 0:
            errors.append("Cultivated Area must be a positive number greater than 0.")
        if annual_rainfall is None or annual_rainfall < 0:
            errors.append("Annual Rainfall must be a non-negative number.")
        if fertilizer is None or fertilizer < 0:
            errors.append("Fertilizer amount cannot be negative.")
        if pesticide is None or pesticide < 0:
            errors.append("Pesticide amount cannot be negative.")

        if crop_year is not None and (crop_year < 1990 or crop_year > 2035):
            errors.append(f"Crop Year {crop_year} is out of realistic agricultural range (1990-2035).")

        # Check vocabulary
        normalized_crop = None
        if crop and str(crop).strip():
            clean_crop = str(crop).strip().lower()
            if clean_crop in self.crop_lookup:
                normalized_crop = self.crop_lookup[clean_crop]
            else:
                # Find close suggestions if possible
                suggestions = [c for c in self.supported_crops if clean_crop in c.lower() or c.lower() in clean_crop]
                sugg_msg = f" Did you mean: {', '.join(suggestions[:4])}?" if suggestions else ""
                errors.append(
                    f"Unsupported Crop: '{crop}' is not in the agricultural yield training dataset.{sugg_msg} "
                    f"Please choose from one of the {len(self.supported_crops)} supported crops such as Rice, Wheat, Sugarcane, Potato, Onion, Maize, etc."
                )

        normalized_state = None
        if state and str(state).strip():
            clean_state = str(state).strip().lower()
            if clean_state in self.state_lookup:
                normalized_state = self.state_lookup[clean_state]
            else:
                errors.append(f"Unsupported State: '{state}'. Please select a valid Indian State from the supported list.")

        normalized_season = None
        if season and str(season).strip():
            clean_season = str(season).strip().lower()
            if clean_season in self.season_lookup:
                normalized_season = self.season_lookup[clean_season]
            else:
                errors.append(
                    f"Unsupported Season: '{season}'. Supported seasons are: {', '.join(self.supported_seasons)}."
                )

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "normalized_crop": normalized_crop,
            "normalized_state": normalized_state,
            "normalized_season": normalized_season
        }

    def predict(
        self,
        crop: str,
        season: str,
        state: str,
        area: float,
        annual_rainfall: float,
        fertilizer: float,
        pesticide: float,
        crop_year: int = 2026
    ) -> Dict[str, Any]:
        """Perform validated ML prediction using pre-loaded pipeline."""
        if not self.model_loaded or self.model is None:
            raise RuntimeError("Crop yield ML model is not loaded on backend.")

        # 1. Validation
        val_res = self.validate_inputs(
            crop=crop,
            season=season,
            state=state,
            area=area,
            annual_rainfall=annual_rainfall,
            fertilizer=fertilizer,
            pesticide=pesticide,
            crop_year=crop_year
        )

        if not val_res["is_valid"]:
            return {
                "success": False,
                "errors": val_res["errors"],
                "message": "Validation failed: " + "; ".join(val_res["errors"])
            }

        canonical_crop = val_res["normalized_crop"]
        canonical_state = val_res["normalized_state"]
        canonical_season = val_res["normalized_season"]

        # 2. Prepare DataFrame matching exact featurization order
        input_df = pd.DataFrame([{
            "Crop": canonical_crop,
            "Crop_Year": crop_year,
            "Season": canonical_season,
            "State": canonical_state,
            "Area": float(area),
            "Annual_Rainfall": float(annual_rainfall),
            "Fertilizer": float(fertilizer),
            "Pesticide": float(pesticide)
        }])

        # 3. Model Inference
        raw_pred = self.model.predict(input_df)[0]
        # Yield cannot be negative
        predicted_yield = max(0.0, float(raw_pred))

        # 4. Total estimated harvest (Production = Area * Yield)
        estimated_production = round(predicted_yield * float(area), 2)

        # 5. Unit resolution
        is_coconut = canonical_crop.lower() == "coconut"
        unit_label = "1000 Nuts / Hectare" if is_coconut else "Tonnes / Hectare"
        total_prod_unit = "1000 Nuts" if is_coconut else "Tonnes"

        # Model metrics reference
        model_name = self.metrics.get("model", "Random Forest Regressor") if self.metrics else "Random Forest Regressor"
        test_r2 = self.metrics.get("r2", 0.9143) if self.metrics else 0.9143
        test_mae = self.metrics.get("mae", 16.29) if self.metrics else 16.29
        test_medae = self.metrics.get("median_absolute_error", 0.35) if self.metrics else 0.35
        feature_importances = self.metrics.get("feature_importances", {}) if self.metrics else {}

        crop_benchmark = {}
        if self.metrics and "crop_benchmarks" in self.metrics:
            crop_benchmark = self.metrics["crop_benchmarks"].get(canonical_crop, {})

        return {
            "success": True,
            "predicted_yield": round(predicted_yield, 2),
            "unit": unit_label,
            "crop": canonical_crop,
            "season": canonical_season,
            "state": canonical_state,
            "cultivated_area_ha": float(area),
            "estimated_total_production": estimated_production,
            "total_production_unit": total_prod_unit,
            "model": model_name,
            "model_performance": {
                "r2_score": test_r2,
                "mae": test_mae,
                "median_absolute_error": test_medae,
                "test_samples": self.metrics.get("test_samples", 2954) if self.metrics else 2954,
                "training_samples": self.metrics.get("training_samples", 13781) if self.metrics else 13781,
                "crop_specific_benchmark": crop_benchmark
            },
            "explainability": {
                "factors_considered": [
                    "Crop", "State", "Annual_Rainfall", "Area", "Fertilizer", "Pesticide", "Season", "Crop_Year"
                ],
                "feature_importance_pct": feature_importances,
                "disclaimer": (
                    "This is an estimated yield based on historical agricultural data. "
                    "Actual yield may vary depending on weather, soil conditions, crop management and other factors."
                )
            }
        }

    def get_metadata(self) -> Dict[str, Any]:
        """Return supported vocabulary and metrics for UI dropdowns and validation."""
        return {
            "supported_crops": self.supported_crops,
            "supported_seasons": self.supported_seasons,
            "supported_states": self.supported_states,
            "metrics": self.metrics
        }

# Global singleton instance loaded once on startup
yield_predictor = CropYieldPredictor()
