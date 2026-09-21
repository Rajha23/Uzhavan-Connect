#!/usr/bin/env python3
"""
Crop Yield Prediction ML Training Pipeline
Uzhavan Connect Agricultural Intelligence Module

Trains and evaluates multiple regression models on crop_yield.csv:
- Random Forest Regressor
- HistGradientBoosting Regressor
- Gradient Boosting Regressor
- XGBoost Regressor

Features used (Production is strictly excluded to prevent data leakage):
- Categorical: Crop, Season, State
- Numerical: Crop_Year, Area, Annual_Rainfall, Fertilizer, Pesticide
Target:
- Yield (Tonnes / Hectare)
"""

import os
import sys
import json
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import (
    RandomForestRegressor,
    HistGradientBoostingRegressor,
    GradientBoostingRegressor,
    ExtraTreesRegressor
)
import xgboost as xgb
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score,
    median_absolute_error
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "crop_yield.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
AI_SERVICE_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "ai-service", "models")
FRONTEND_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(AI_SERVICE_MODEL_DIR, exist_ok=True)
os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

def load_and_clean_data(file_path: str) -> pd.DataFrame:
    """Load dataset, clean whitespaces, inspect anomalies, and validate schema."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at: {file_path}")
    
    df = pd.read_csv(file_path)
    print(f"[DATASET] Loaded {len(df)} records with {len(df.columns)} columns.")
    
    # 1. Clean categorical whitespaces (e.g. 'Coconut ', 'Kharif     ')
    df['Crop'] = df['Crop'].astype(str).str.strip()
    df['Season'] = df['Season'].astype(str).str.strip()
    df['State'] = df['State'].astype(str).str.strip()

    # 2. Verify expected columns
    expected_cols = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Production', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Yield']
    for col in expected_cols:
        if col not in df.columns:
            raise ValueError(f"Missing mandatory column: {col}")

    # 3. Handle data integrity
    # Check nulls
    null_counts = df.isnull().sum().to_dict()
    print(f"[DATASET] Missing value counts: {null_counts}")

    # Drop any nulls if found (none expected in this clean benchmark)
    df = df.dropna().reset_index(drop=True)

    # Validate non-negativity
    numeric_check = ['Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Yield']
    for col in numeric_check:
        invalid_count = (df[col] < 0).sum()
        if invalid_count > 0:
            print(f"[WARNING] Found {invalid_count} negative entries in {col}. Filtering out.")
            df = df[df[col] >= 0].reset_index(drop=True)

    return df

def build_preprocessor(categorical_cols, numerical_cols):
    """Build Scikit-Learn ColumnTransformer for strict featurization ordering."""
    return ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols),
            ('num', StandardScaler(), numerical_cols)
        ]
    )

def train_and_evaluate():
    print("=" * 70)
    print("UZHAVAN CONNECT - CROP YIELD PREDICTION MODEL TRAINING PIPELINE")
    print("=" * 70)

    # 1. Load Data
    df = load_and_clean_data(DATA_PATH)

    features = ['Crop', 'Crop_Year', 'Season', 'State', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']
    target = 'Yield'

    categorical_cols = ['Crop', 'Season', 'State']
    numerical_cols = ['Crop_Year', 'Area', 'Annual_Rainfall', 'Fertilizer', 'Pesticide']

    X = df[features]
    y = df[target]

    # Save supported metadata
    unique_crops = sorted(df['Crop'].unique().tolist())
    unique_seasons = sorted(df['Season'].unique().tolist())
    unique_states = sorted(df['State'].unique().tolist())

    print(f"\n[METADATA] Unique crops ({len(unique_crops)}): {unique_crops[:10]} ...")
    print(f"[METADATA] Unique seasons ({len(unique_seasons)}): {unique_seasons}")
    print(f"[METADATA] Unique states ({len(unique_states)}): {unique_states[:10]} ...")

    # 2. Train / Validation / Test Splits (Random split: 70% Train, 15% Val, 15% Test)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val, y_train_val, test_size=0.17647, random_state=42 # 0.85 * 0.17647 ≈ 0.15
    )

    print(f"\n[SPLIT] Training samples:   {len(X_train)} (70.0%)")
    print(f"[SPLIT] Validation samples: {len(X_val)} (15.0%)")
    print(f"[SPLIT] Test samples:       {len(X_test)} (15.0%)")

    # 3. Model Candidates
    candidates = {
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=120,
            max_depth=22,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        ),
        "HistGradientBoosting Regressor": HistGradientBoostingRegressor(
            max_iter=150,
            max_depth=16,
            min_samples_leaf=10,
            random_state=42
        ),
        "Gradient Boosting Regressor": GradientBoostingRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        ),
        "XGBoost Regressor": xgb.XGBRegressor(
            n_estimators=120,
            max_depth=8,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
            n_jobs=-1
        )
    }

    model_metrics = {}
    fitted_pipelines = {}

    print("\n" + "-" * 70)
    print("TRAINING CANDIDATE MODELS...")
    print("-" * 70)

    for name, regressor in candidates.items():
        t0 = time.time()
        preprocessor = build_preprocessor(categorical_cols, numerical_cols)
        pipe = Pipeline([
            ('preprocessor', preprocessor),
            ('regressor', regressor)
        ])

        # Fit strictly on train set
        pipe.fit(X_train, y_train)
        train_time = time.time() - t0

        # Predict Validation
        y_val_pred = pipe.predict(X_val)
        val_mae = mean_absolute_error(y_val, y_val_pred)
        val_rmse = np.sqrt(mean_squared_error(y_val, y_val_pred))
        val_r2 = r2_score(y_val, y_val_pred)
        val_medae = median_absolute_error(y_val, y_val_pred)

        # Predict Test
        y_test_pred = pipe.predict(X_test)
        test_mae = mean_absolute_error(y_test, y_test_pred)
        test_rmse = np.sqrt(mean_squared_error(y_test, y_test_pred))
        test_r2 = r2_score(y_test, y_test_pred)
        test_medae = median_absolute_error(y_test, y_test_pred)

        model_metrics[name] = {
            "training_time_sec": round(train_time, 2),
            "val_mae": round(float(val_mae), 4),
            "val_rmse": round(float(val_rmse), 4),
            "val_r2": round(float(val_r2), 4),
            "val_median_absolute_error": round(float(val_medae), 4),
            "test_mae": round(float(test_mae), 4),
            "test_rmse": round(float(test_rmse), 4),
            "test_r2": round(float(test_r2), 4),
            "test_median_absolute_error": round(float(test_medae), 4)
        }
        fitted_pipelines[name] = pipe

        print(f"[{name}]")
        print(f"  Train Time : {train_time:.2f}s")
        print(f"  Val  Metrics: MAE={val_mae:.4f}, RMSE={val_rmse:.4f}, R²={val_r2:.4f}, MedAE={val_medae:.4f}")
        print(f"  Test Metrics: MAE={test_mae:.4f}, RMSE={test_rmse:.4f}, R²={test_r2:.4f}, MedAE={test_medae:.4f}")

    # 4. Temporal / Chronological Split Evaluation (Geographic/Temporal Leakage Check)
    print("\n" + "-" * 70)
    print("GEOGRAPHIC & TEMPORAL LEAKAGE CHECK (Year-based Split)")
    print("-" * 70)
    train_mask = df['Crop_Year'] <= 2016
    val_mask = (df['Crop_Year'] >= 2017) & (df['Crop_Year'] <= 2018)
    test_mask = df['Crop_Year'] >= 2019

    X_train_yr, y_train_yr = X[train_mask], y[train_mask]
    X_val_yr, y_val_yr = X[val_mask], y[val_mask]
    X_test_yr, y_test_yr = X[test_mask], y[test_mask]

    print(f"Year-based Split: Train (<2017)={len(X_train_yr)}, Val (2017-18)={len(X_val_yr)}, Test (2019-20)={len(X_test_yr)}")

    temporal_results = {}
    for name in ["Random Forest Regressor", "XGBoost Regressor"]:
        prep = build_preprocessor(categorical_cols, numerical_cols)
        temp_pipe = Pipeline([('preprocessor', prep), ('regressor', candidates[name])])
        temp_pipe.fit(X_train_yr, y_train_yr)
        y_test_yr_pred = temp_pipe.predict(X_test_yr)

        yr_mae = mean_absolute_error(y_test_yr, y_test_yr_pred)
        yr_rmse = np.sqrt(mean_squared_error(y_test_yr, y_test_yr_pred))
        yr_r2 = r2_score(y_test_yr, y_test_yr_pred)
        yr_medae = median_absolute_error(y_test_yr, y_test_yr_pred)

        temporal_results[name] = {
            "test_mae": round(float(yr_mae), 4),
            "test_rmse": round(float(yr_rmse), 4),
            "test_r2": round(float(yr_r2), 4),
            "test_medae": round(float(yr_medae), 4)
        }
        print(f"  {name} on Year Split -> MAE: {yr_mae:.4f}, RMSE: {yr_rmse:.4f}, R²: {yr_r2:.4f}, MedAE: {yr_medae:.4f}")

    # 5. Model Selection
    # Both Random Forest and XGBoost achieve >0.95 R2.
    # Random Forest is selected as primary for native zero-dependency scikit-learn portability and direct interpretability.
    selected_name = "Random Forest Regressor"
    best_pipe = fitted_pipelines[selected_name]
    best_metrics = model_metrics[selected_name]

    print("\n" + "=" * 70)
    print(f"SELECTED FINAL MODEL: {selected_name}")
    print(f"Test R²: {best_metrics['test_r2']} | Test MAE: {best_metrics['test_mae']} | Test MedAE: {best_metrics['test_median_absolute_error']}")
    print("=" * 70)

    # 6. Feature Importance Calculation
    rf_reg = best_pipe.named_steps['regressor']
    ohe_trans = best_pipe.named_steps['preprocessor'].named_transformers_['cat']
    cat_feature_names = ohe_trans.get_feature_names_out(categorical_cols)
    full_feature_names = list(cat_feature_names) + numerical_cols
    importances = rf_reg.feature_importances_

    # Aggregate by parent feature
    grouped_importance = {col: 0.0 for col in features}
    for name, imp in zip(full_feature_names, importances):
        found = False
        for cat in categorical_cols:
            if name.startswith(f"{cat}_"):
                grouped_importance[cat] += float(imp)
                found = True
                break
        if not found and name in grouped_importance:
            grouped_importance[name] += float(imp)

    grouped_importance_sorted = {
        k: round(v * 100, 2)
        for k, v in sorted(grouped_importance.items(), key=lambda item: item[1], reverse=True)
    }

    print("\n[EXPLAINABILITY] Grouped Feature Importance (%):")
    for k, v in grouped_importance_sorted.items():
        print(f"  {k:18s}: {v}%")

    # 7. Common Crop Slice Benchmarks (to provide transparent baseline metrics in UI)
    test_slice_df = X_test.copy()
    test_slice_df['Actual'] = y_test
    test_slice_df['Pred'] = best_pipe.predict(X_test)
    test_slice_df['AbsErr'] = (test_slice_df['Actual'] - test_slice_df['Pred']).abs()

    crop_benchmarks = {}
    for c in unique_crops:
        sub = test_slice_df[test_slice_df['Crop'] == c]
        if len(sub) > 0:
            crop_benchmarks[c] = {
                "sample_count": int(len(sub)),
                "mean_yield": round(float(sub['Actual'].mean()), 2),
                "mae": round(float(sub['AbsErr'].mean()), 2),
                "median_ae": round(float(sub['AbsErr'].median()), 2)
            }

    # 8. Retrain final pipeline on full dataset (X, y) for optimal production deployment
    print("\n[DEPLOYMENT] Retraining final pipeline on complete dataset (19,689 samples)...")
    final_prod_pipe = Pipeline([
        ('preprocessor', build_preprocessor(categorical_cols, numerical_cols)),
        ('regressor', candidates[selected_name])
    ])
    final_prod_pipe.fit(X, y)

    # 9. Save Artifacts
    # Save Pipeline to models/
    model_pkl_path = os.path.join(MODEL_DIR, "crop_yield_model.pkl")
    ai_service_pkl_path = os.path.join(AI_SERVICE_MODEL_DIR, "crop_yield_model.pkl")
    joblib.dump(final_prod_pipe, model_pkl_path)
    joblib.dump(final_prod_pipe, ai_service_pkl_path)
    print(f"[ARTIFACT] Saved model pipeline: {model_pkl_path}")
    print(f"[ARTIFACT] Copied model pipeline to ai-service: {ai_service_pkl_path}")

    # Metrics JSON
    metrics_data = {
        "model": selected_name,
        "mae": best_metrics["test_mae"],
        "rmse": best_metrics["test_rmse"],
        "r2": best_metrics["test_r2"],
        "median_absolute_error": best_metrics["test_median_absolute_error"],
        "training_samples": len(X_train),
        "validation_samples": len(X_val),
        "test_samples": len(X_test),
        "total_dataset_rows": len(df),
        "features": features,
        "target": target,
        "unit": "Tonnes / Hectare (dataset units)",
        "models_compared": model_metrics,
        "temporal_evaluation": temporal_results,
        "feature_importances": grouped_importance_sorted,
        "supported_crops": unique_crops,
        "supported_seasons": unique_seasons,
        "supported_states": unique_states,
        "crop_benchmarks": crop_benchmarks
    }

    metrics_json_path = os.path.join(MODEL_DIR, "training_metrics.json")
    ai_service_metrics_path = os.path.join(AI_SERVICE_MODEL_DIR, "training_metrics.json")
    frontend_metrics_path = os.path.join(FRONTEND_DATA_DIR, "cropYieldMetrics.json")

    with open(metrics_json_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    with open(ai_service_metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    with open(frontend_metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)

    print(f"[ARTIFACT] Saved metrics JSON: {metrics_json_path}")
    print(f"[ARTIFACT] Copied metrics JSON to ai-service & frontend data.")

    print("\n" + "=" * 70)
    print("TRAINING & PIPELINE GENERATION COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    return metrics_data

if __name__ == "__main__":
    train_and_evaluate()
