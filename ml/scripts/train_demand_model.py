#!/usr/bin/env python3
"""
Market Demand Prediction ML Training Pipeline
Uzhavan Connect Agricultural Intelligence Module

Trains a Random Forest Regressor to predict monthly demand and supply.
Features:
- Categorical: Crop, State
- Numerical: Year, Month
Targets:
- Demand (Tonnes)
- Market Supply (Tonnes)
"""

import os
import json
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "all_crops_monthly.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
AI_SERVICE_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ai-service", "models")
FRONTEND_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "src", "data")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(AI_SERVICE_MODEL_DIR, exist_ok=True)
os.makedirs(FRONTEND_DATA_DIR, exist_ok=True)

def load_and_clean_data(file_path: str) -> pd.DataFrame:
    df = pd.read_csv(file_path)
    print(f"Loaded {len(df)} records.")
    
    # Rename messy columns from PDF extraction
    cols_mapping = {}
    for col in df.columns:
        clean_col = col.replace('\n', '').replace(' ', '')
        cols_mapping[col] = clean_col
    df.rename(columns=cols_mapping, inplace=True)
    
    # Clean string numbers with spaces
    for col in ['market_supply_t', 'demand_t']:
        if df[col].dtype == object:
            df[col] = df[col].astype(str).str.replace(r'[^\d.]', '', regex=True).astype(float)
            
    df['crop_name'] = df['crop_name'].str.strip()
    df['state'] = df['state'].str.strip()
    
    return df

def train():
    print("=" * 70)
    print("TRAINING DEMAND MODEL")
    print("=" * 70)

    df = load_and_clean_data(DATA_PATH)
    
    features = ['crop_name', 'state', 'year', 'month']
    targets = ['demand_t', 'market_supply_t']
    
    X = df[features]
    y = df[targets]
    
    cat_cols = ['crop_name', 'state']
    num_cols = ['year', 'month']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols),
            ('num', StandardScaler(), num_cols)
        ]
    )
    
    pipe = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
    ])
    
    pipe.fit(X_train, y_train)
    
    y_pred = pipe.predict(X_test)
    
    r2_demand = r2_score(y_test['demand_t'], y_pred[:, 0])
    mae_demand = mean_absolute_error(y_test['demand_t'], y_pred[:, 0])
    
    r2_supply = r2_score(y_test['market_supply_t'], y_pred[:, 1])
    mae_supply = mean_absolute_error(y_test['market_supply_t'], y_pred[:, 1])
    
    print(f"Demand R2: {r2_demand:.4f}, MAE: {mae_demand:.4f}")
    print(f"Supply R2: {r2_supply:.4f}, MAE: {mae_supply:.4f}")
    
    # Save the pipeline
    joblib.dump(pipe, os.path.join(MODEL_DIR, "demand_model.joblib"))
    joblib.dump(pipe, os.path.join(AI_SERVICE_MODEL_DIR, "demand_model.joblib"))
    print("Model saved.")
    
    metrics = {
        "model": "RandomForestRegressor MultiOutput",
        "demand_r2": float(r2_demand),
        "demand_mae": float(mae_demand),
        "supply_r2": float(r2_supply),
        "supply_mae": float(mae_supply),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "supported_crops": sorted(df['crop_name'].unique().tolist()),
        "supported_states": sorted(df['state'].unique().tolist())
    }
    
    with open(os.path.join(MODEL_DIR, "demand_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

if __name__ == "__main__":
    train()
