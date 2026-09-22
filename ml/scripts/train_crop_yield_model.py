"""
Uzhavan Connect - Supervised Machine Learning Pipeline for Crop Yield Prediction
Trains predictive regression models on historical agricultural data to predict Yield (Tonnes/Hectare).
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, median_absolute_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "crop_yield.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ai-service", "models")
MODEL_FILE = os.path.join(MODEL_DIR, "crop_yield_model.pkl")
METRICS_FILE = os.path.join(MODEL_DIR, "training_metrics.json")

def load_and_preprocess():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset file not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} records from {DATA_PATH}")

    # Remove duplicates and missing values if any
    df = df.drop_duplicates().dropna()

    # Calculate target (Yield is already in the dataset, but we verify it's valid)
    # We are predicting "Yield"
    return df

def train_yield_pipeline():
    df = load_and_preprocess()

    categorical_features = ["Crop", "State", "Season"]
    numeric_features = ["Crop_Year", "Area", "Annual_Rainfall", "Fertilizer", "Pesticide"]
    target = "Yield"

    X = df[categorical_features + numeric_features]
    y = df[target]

    # Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ]
    )

    # Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Model
    print("Training RandomForestRegressor...")
    model = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
    ])
    
    model.fit(X_train, y_train)

    # Evaluate
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    mae = mean_absolute_error(y_test, y_pred)
    medae = median_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"Test MAE: {mae:.2f}")
    print(f"Test Median AE: {medae:.2f}")
    print(f"Test R2 Score: {r2:.4f}")

    # Feature Importance (from RandomForest)
    rf_model = model.named_steps["regressor"]
    ohe = model.named_steps["preprocessor"].named_transformers_["cat"]
    cat_feature_names = ohe.get_feature_names_out(categorical_features)
    all_feature_names = numeric_features + list(cat_feature_names)
    importances = rf_model.feature_importances_
    
    # Aggregate importances back to original features
    feature_importance_dict = {feat: 0.0 for feat in categorical_features + numeric_features}
    for name, imp in zip(all_feature_names, importances):
        if name in numeric_features:
            feature_importance_dict[name] += imp
        else:
            # name is like Crop_Rice
            orig_feat = name.split("_")[0]
            if orig_feat in feature_importance_dict:
                feature_importance_dict[orig_feat] += imp

    # Normalize to percentages
    total_imp = sum(feature_importance_dict.values())
    pct_importances = {k: round((v / total_imp) * 100, 1) for k, v in feature_importance_dict.items() if v > 0}
    # Sort
    pct_importances = dict(sorted(pct_importances.items(), key=lambda item: item[1], reverse=True))

    # Crop Benchmarks (Historical Averages)
    crop_benchmarks = df.groupby("Crop")[target].mean().round(2).to_dict()
    benchmarks_formatted = {crop: {"mean_yield": mean_val} for crop, mean_val in crop_benchmarks.items()}

    metrics = {
        "dataset_name": "Crop Yield Historical Dataset",
        "sample_size": len(df),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "last_trained_at": datetime.now().isoformat(),
        "model": "RandomForestRegressor(n_estimators=100)",
        "r2": round(r2, 4),
        "mae": round(mae, 2),
        "median_absolute_error": round(medae, 2),
        "feature_importances": pct_importances,
        "supported_crops": sorted(df["Crop"].unique().tolist()),
        "supported_states": sorted(df["State"].unique().tolist()),
        "supported_seasons": sorted(df["Season"].unique().tolist()),
        "crop_benchmarks": benchmarks_formatted
    }

    # Save artifact
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, MODEL_FILE)
    print(f"Saved trained model to {MODEL_FILE}")

    with open(METRICS_FILE, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"Saved metrics to {METRICS_FILE}")

if __name__ == "__main__":
    train_yield_pipeline()
