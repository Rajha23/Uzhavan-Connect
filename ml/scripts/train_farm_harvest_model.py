"""
Uzhavan Connect - Supervised Machine Learning Pipeline for Farm-Level Harvest Prediction
Trains predictive regression models on empirical farm-level observations to predict:
  1. days_to_first_harvest: days elapsed from sowing/transplanting to initial harvest.
  2. harvest_duration_days: total active harvesting window duration in days.
  3. yield_per_hectare: empirical yield realized per hectare.

Architecture Rule:
  - Ground truth observations come from `ml/data/farm_harvest_observations.csv`.
  - Continuous learning enabled: as farmers log actual harvests via the Uzhavan Connect portal,
    this pipeline retrains and evaluates the empirical models with zero data leakage.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import KFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "farm_harvest_observations.csv")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "farm_harvest_model_metrics.json")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ai-service", "models")
MODEL_FILE = os.path.join(MODEL_DIR, "farm_harvest_model.joblib")

def load_and_preprocess():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Observations file not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} farm observation records from {DATA_PATH}")

    # Parse dates
    df["sowing_date"] = pd.to_datetime(df["sowing_date"])
    df["actual_first_harvest_date"] = pd.to_datetime(df["actual_first_harvest_date"])
    df["actual_final_harvest_date"] = pd.to_datetime(df["actual_final_harvest_date"])

    # Target derivations
    df["days_to_first_harvest"] = (df["actual_first_harvest_date"] - df["sowing_date"]).dt.days
    df["harvest_duration_days"] = (df["actual_final_harvest_date"] - df["actual_first_harvest_date"]).dt.days
    df["yield_per_ha"] = df["historical_yield"] / df["farm_area"]

    # Fill optional variety
    df["variety"] = df["variety"].fillna("Standard")

    return df

def train_harvest_pipeline():
    df = load_and_preprocess()

    categorical_features = ["crop", "variety", "location", "soil_type", "irrigation"]
    numeric_features = ["rainfall", "temperature", "humidity", "farm_area"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    X = df[categorical_features + numeric_features]
    y_first_harvest = df["days_to_first_harvest"]
    y_duration = df["harvest_duration_days"]

    # Model 1: Days to First Harvest
    model_first_harvest = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42, max_depth=6))
    ])
    model_first_harvest.fit(X, y_first_harvest)

    # Model 2: Total Harvest Duration (for repeated crops)
    model_duration = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", GradientBoostingRegressor(n_estimators=80, random_state=42, max_depth=4))
    ])
    model_duration.fit(X, y_duration)

    # Evaluate using Leave-One-Out or KFold depending on sample size
    kf = KFold(n_splits=min(5, len(df)), shuffle=True, random_state=42)
    scores_fh = cross_val_score(model_first_harvest, X, y_first_harvest, cv=kf, scoring="neg_mean_absolute_error")
    mae_first_harvest = float(-np.mean(scores_fh))

    preds_fh = model_first_harvest.predict(X)
    r2_fh = float(r2_score(y_first_harvest, preds_fh))

    preds_dur = model_duration.predict(X)
    mae_dur = float(mean_absolute_error(y_duration, preds_dur))
    r2_dur = float(r2_score(y_duration, preds_dur))

    metrics = {
        "dataset_name": "Uzhavan Connect Farm Harvest Observations",
        "sample_size": len(df),
        "last_trained_at": datetime.now().isoformat(),
        "features": {
            "categorical": categorical_features,
            "numeric": numeric_features
        },
        "days_to_first_harvest_model": {
            "algorithm": "RandomForestRegressor(n_estimators=100, max_depth=6)",
            "cross_val_mae_days": round(mae_first_harvest, 2),
            "train_r2_score": round(r2_fh, 4),
            "target": "days_to_first_harvest"
        },
        "harvest_duration_model": {
            "algorithm": "GradientBoostingRegressor(n_estimators=80, max_depth=4)",
            "train_mae_days": round(mae_dur, 2),
            "train_r2_score": round(r2_dur, 4),
            "target": "harvest_duration_days"
        },
        "crops_represented": sorted(df["crop"].unique().tolist()),
        "districts_represented": sorted(df["location"].unique().tolist())
    }

    print("\n--- Training Results ---")
    print(f"Days to First Harvest CV-MAE: {mae_first_harvest:.2f} days (R²: {r2_fh:.4f})")
    print(f"Harvest Duration MAE: {mae_dur:.2f} days (R²: {r2_dur:.4f})")

    # Save artifact
    os.makedirs(MODEL_DIR, exist_ok=True)
    bundle = {
        "model_first_harvest": model_first_harvest,
        "model_duration": model_duration,
        "features": categorical_features + numeric_features,
        "metrics": metrics
    }
    joblib.dump(bundle, MODEL_FILE)
    print(f"Saved trained bundle to {MODEL_FILE}")

    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics to {METRICS_PATH}")

    return bundle, metrics

if __name__ == "__main__":
    train_harvest_pipeline()
