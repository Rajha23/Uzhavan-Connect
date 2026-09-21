"""
Uzhavan Connect - Crop Harvest Forecasting & Calendar Engine
Translates agronomic calendar references (Uzhavan_Connect_Crop_Details_Database.pdf)
and empirical farm observations into actionable harvest schedules for farmers.
"""

import os
import json
import csv
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CALENDAR_PATH = os.path.join(BASE_DIR, "crop_calendar_master.json")
OBSERVATIONS_PATH = os.path.join(BASE_DIR, "..", "ml", "data", "farm_harvest_observations.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "farm_harvest_model.joblib")

class CropHarvestEngine:
    def __init__(self):
        self.crops_db: List[Dict[str, Any]] = []
        self.crops_by_name: Dict[str, Dict[str, Any]] = {}
        self.crops_by_id: Dict[str, Dict[str, Any]] = {}
        self.ml_bundle: Optional[Dict[str, Any]] = None
        self._load_database()
        self._load_ml_model()

    def _load_database(self):
        if not os.path.exists(CALENDAR_PATH):
            print(f"[CropHarvestEngine] Warning: {CALENDAR_PATH} not found.")
            return

        with open(CALENDAR_PATH, "r", encoding="utf-8") as f:
            self.crops_db = json.load(f)

        for item in self.crops_db:
            cid = item.get("crop_id", "").lower()
            cname = item.get("crop_name", "").lower()
            self.crops_by_id[cid] = item
            self.crops_by_name[cname] = item

            # Also index alias variants (e.g. "rice" for "rice/paddy", "okra" for "ladies finger/okra")
            if "/" in cname:
                for part in cname.split("/"):
                    self.crops_by_name[part.strip()] = item
            if "ladies finger" in cname:
                self.crops_by_name["okra"] = item
                self.crops_by_name["bhendi"] = item

        print(f"[CropHarvestEngine] Successfully indexed {len(self.crops_db)} crops from Crop Calendar Master.")

    def _load_ml_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.ml_bundle = joblib.load(MODEL_PATH)
                print(f"[CropHarvestEngine] Supervised farm harvest ML model loaded from {MODEL_PATH}")
            except Exception as e:
                print(f"[CropHarvestEngine] Notice: Could not load farm ML model: {e}")
        else:
            print("[CropHarvestEngine] Notice: No pre-compiled farm ML model bundle found at startup.")

    def get_supported_crops(self) -> List[Dict[str, Any]]:
        return [
            {
                "crop_id": c["crop_id"],
                "crop_name": c["crop_name"],
                "category": c["category"],
                "season": c["season"],
                "harvest_type": c["harvest_type"],
                "first_harvest_days": c.get("first_harvest_days", f"{c['first_harvest_days_min']}–{c['first_harvest_days_max']} days"),
                "harvest_interval_days": c["harvest_interval_days"],
                "soil_type": c["soil_type"],
                "water_requirement": c["water_requirement"]
            }
            for c in self.crops_db
        ]

    def find_crop_entry(self, crop_query: str) -> Optional[Dict[str, Any]]:
        q = crop_query.strip().lower()
        if q in self.crops_by_id:
            return self.crops_by_id[q]
        if q in self.crops_by_name:
            return self.crops_by_name[q]

        # Fuzzy / substring match
        for name, entry in self.crops_by_name.items():
            if q in name or name in q:
                return entry

        return None

    def forecast_harvest(
        self,
        crop: str,
        sowing_date: str,
        variety: Optional[str] = None,
        location: Optional[str] = "Tamil Nadu",
        season: Optional[str] = None,
        soil_type: Optional[str] = None,
        irrigation: Optional[str] = None,
        rainfall: Optional[float] = None,
        temperature: Optional[float] = None,
        humidity: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates prospective harvest windows, intervals, and schedules.
        Combines crop calendar reference values with site-specific agronomic adjustments.
        """
        entry = self.find_crop_entry(crop)
        if not entry:
            raise ValueError(f"Crop '{crop}' not found in Crop Calendar Database.")

        try:
            sow_dt = datetime.strptime(sowing_date, "%Y-%m-%d")
        except ValueError:
            raise ValueError(f"Invalid sowing_date '{sowing_date}'. Expected ISO format YYYY-MM-DD.")

        min_days = entry["first_harvest_days_min"]
        max_days = entry["first_harvest_days_max"]
        crop_duration = entry["crop_duration_days"]
        harvest_type = entry["harvest_type"]
        interval_days = entry.get("harvest_interval_days")

        # Micro-adjustments based on weather and soil
        adj_min = float(min_days)
        adj_max = float(max_days)

        adjustments_applied = []

        # 1. Temperature calibration:
        # Hotter conditions speed up vegetative-to-flowering transitions slightly (3-5%)
        # Cooler conditions slow it down.
        if temperature is not None:
            temp_range = entry.get("temperature_range", "20–30°C")
            temp_numbers = [float(n) for n in re.findall(r"\d+", temp_range)]
            if len(temp_numbers) >= 2:
                opt_min, opt_max = temp_numbers[0], temp_numbers[1]
                if temperature > opt_max + 3:
                    delta = round(min_days * 0.04)
                    adj_min = max(20.0, adj_min - delta)
                    adj_max = max(adj_min + 5, adj_max - delta)
                    adjustments_applied.append(f"High ambient temperature ({temperature}°C) accelerates maturity window by ~{delta} days")
                elif temperature < opt_min - 3:
                    delta = round(min_days * 0.05)
                    adj_min += delta
                    adj_max += delta
                    adjustments_applied.append(f"Sub-optimal cooler temperature ({temperature}°C) extends vegetative phase by ~{delta} days")

        # 2. Soil compatibility calibration:
        if soil_type:
            target_soil = entry.get("soil_type", "").lower()
            if "sandy" in soil_type.lower() and "clay" in target_soil:
                adj_min += 2
                adjustments_applied.append("Soil texture (sandy) slightly delays establishment compared to ideal clay/loam")
            elif "drip" in (irrigation or "").lower():
                # Optimized drip irrigation accelerates uniform canopy and flowering
                delta = max(1, round(min_days * 0.03))
                adj_min = max(20.0, adj_min - delta)
                adjustments_applied.append(f"Optimized drip irrigation provides rapid establishment (-{delta} days)")
            elif "rainfed" in (irrigation or "").lower():
                delta = max(2, round(min_days * 0.05))
                adj_min += delta
                adj_max += delta
                adjustments_applied.append(f"Rainfed moisture reliance widens harvest start window (+{delta} days)")

        # Target expected first harvest date (median of adjusted window)
        median_first_days = round((adj_min + adj_max) / 2)
        expected_first_harvest_dt = sow_dt + timedelta(days=median_first_days)
        first_window_start_dt = sow_dt + timedelta(days=round(adj_min))
        first_window_end_dt = sow_dt + timedelta(days=round(adj_max))

        # Expected final harvest date
        expected_final_harvest_dt = sow_dt + timedelta(days=crop_duration)
        if expected_final_harvest_dt <= expected_first_harvest_dt:
            expected_final_harvest_dt = expected_first_harvest_dt + timedelta(days=30)

        # Harvest interval text and picking schedule
        is_repeated = harvest_type in ["Repeated", "Multiple pickings"]
        subsequent_pickings: List[Dict[str, Any]] = []

        if is_repeated and interval_days and interval_days > 0:
            if interval_days == 2:
                harvest_interval_text = "Approximately every 2 days"
            elif interval_days == 3.5:
                harvest_interval_text = "Approximately every 3–4 days"
            elif interval_days == 4:
                harvest_interval_text = "Approximately every 3–5 days"
            elif interval_days == 6:
                harvest_interval_text = "Approximately every 5–7 days"
            elif interval_days >= 30:
                harvest_interval_text = f"Approximately every ~{int(interval_days)} days"
            else:
                harvest_interval_text = f"Approximately every {interval_days} days"

            # Generate scheduled picking dates (up to 8 subsequent pickings or until final harvest)
            curr_pick_dt = expected_first_harvest_dt
            pick_num = 1
            max_pickings = 8

            while curr_pick_dt <= expected_final_harvest_dt and pick_num <= max_pickings:
                subsequent_pickings.append({
                    "pick_number": pick_num,
                    "date": curr_pick_dt.strftime("%Y-%m-%d"),
                    "formatted_date": curr_pick_dt.strftime("%d %b %Y"),
                    "day_name": curr_pick_dt.strftime("%A"),
                    "days_from_sowing": (curr_pick_dt - sow_dt).days,
                    "stage": "First marketable flush" if pick_num == 1 else f"Picking Flush #{pick_num}"
                })
                curr_pick_dt += timedelta(days=round(interval_days))
                pick_num += 1
        else:
            # STRICTLY ONE-TIME HARVEST
            harvest_interval_text = "Single main harvest (one-time; no repeated pickings)"
            subsequent_pickings = []

        # Empirical ML prediction check if model is loaded and relevant
        ml_insight = None
        if self.ml_bundle:
            try:
                # Format single-row DataFrame for first harvest regressor
                import pandas as pd
                df_input = pd.DataFrame([{
                    "crop": entry["crop_name"],
                    "variety": variety or "Standard",
                    "location": location or "Tamil Nadu",
                    "soil_type": soil_type or entry.get("soil_type", "Well-drained loam"),
                    "irrigation": irrigation or "Borewell Drip Irrigation (Optimized)",
                    "rainfall": rainfall if rainfall is not None else 350.0,
                    "temperature": temperature if temperature is not None else 28.0,
                    "humidity": humidity if humidity is not None else 70.0,
                    "farm_area": 1.0
                }])
                model_fh = self.ml_bundle.get("model_first_harvest")
                if model_fh:
                    pred_days = float(model_fh.predict(df_input)[0])
                    ml_insight = {
                        "model_type": "Supervised Random Forest (Trained on farm observations)",
                        "predicted_days_to_first_harvest": round(pred_days, 1),
                        "ml_expected_date": (sow_dt + timedelta(days=round(pred_days))).strftime("%Y-%m-%d"),
                        "cv_mae_days": self.ml_bundle.get("metrics", {}).get("days_to_first_harvest_model", {}).get("cross_val_mae_days"),
                        "training_records": self.ml_bundle.get("metrics", {}).get("sample_size", 0)
                    }
            except Exception as ex:
                print(f"[CropHarvestEngine] Optional ML inference skipped: {ex}")

        return {
            "crop": entry["crop_name"],
            "crop_id": entry["crop_id"],
            "category": entry["category"],
            "variety": variety or "Standard Commercial",
            "location": location,
            "sowing_date": sowing_date,
            "soil_type": soil_type or entry.get("soil_type"),
            "irrigation": irrigation or "Standard",
            "expected_first_harvest_date": expected_first_harvest_dt.strftime("%Y-%m-%d"),
            "expected_first_harvest_formatted": expected_first_harvest_dt.strftime("%d %B %Y"),
            "first_harvest_window": {
                "start_date": first_window_start_dt.strftime("%Y-%m-%d"),
                "end_date": first_window_end_dt.strftime("%Y-%m-%d"),
                "start_formatted": first_window_start_dt.strftime("%d %b %Y"),
                "end_formatted": first_window_end_dt.strftime("%d %b %Y"),
                "days_range": f"{round(adj_min)}–{round(adj_max)} days from sowing"
            },
            "harvest_type": harvest_type,
            "is_repeated_harvest": is_repeated,
            "harvest_interval_days": interval_days,
            "harvest_interval": harvest_interval_text,
            "expected_harvest_period": entry.get("harvest_period", f"{crop_duration} days"),
            "expected_final_harvest_date": expected_final_harvest_dt.strftime("%Y-%m-%d"),
            "expected_final_harvest_formatted": expected_final_harvest_dt.strftime("%d %B %Y"),
            "crop_duration_days": crop_duration,
            "subsequent_pickings": subsequent_pickings,
            "pests": entry.get("pests", "Standard crop pests"),
            "diseases": entry.get("diseases", "Standard crop diseases"),
            "water_requirement": entry.get("water_requirement", "Moderate"),
            "adjustments_applied": adjustments_applied,
            "ml_insight": ml_insight,
            "disclaimer": "Reference values are calibrated from the Uzhavan Connect Crop Details & Harvest Database. Harvest dates may vary with specific micro-climate, seed vigor, and management practices."
        }

    def record_farm_observation(self, observation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Appends a verified farm observation to the continuous learning observations dataset.
        """
        required = ["crop", "location", "sowing_date", "actual_first_harvest_date"]
        for field in required:
            if not observation.get(field):
                raise ValueError(f"Missing required field: {field}")

        os.makedirs(os.path.dirname(OBSERVATIONS_PATH), exist_ok=True)
        file_exists = os.path.exists(OBSERVATIONS_PATH)

        row = {
            "crop": observation.get("crop"),
            "variety": observation.get("variety", "Standard"),
            "location": observation.get("location"),
            "sowing_date": observation.get("sowing_date"),
            "soil_type": observation.get("soil_type", "Loam"),
            "irrigation": observation.get("irrigation", "Borewell Drip Irrigation (Optimized)"),
            "rainfall": float(observation.get("rainfall", 300.0)),
            "temperature": float(observation.get("temperature", 28.0)),
            "humidity": float(observation.get("humidity", 65.0)),
            "farm_area": float(observation.get("farm_area", 1.0)),
            "historical_yield": float(observation.get("historical_yield", 0.0)) if observation.get("historical_yield") else None,
            "actual_first_harvest_date": observation.get("actual_first_harvest_date"),
            "actual_final_harvest_date": observation.get("actual_final_harvest_date")
        }

        with open(OBSERVATIONS_PATH, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=list(row.keys()))
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)

        return {
            "status": "RECORDED",
            "message": "Farm harvest observation successfully recorded for future supervised ML retraining.",
            "observation": row
        }

harvest_engine = CropHarvestEngine()
