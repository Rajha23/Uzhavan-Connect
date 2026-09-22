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
from datetime import datetime

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "crop_prices.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
AI_SERVICE_MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ai-service", "models")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(AI_SERVICE_MODEL_DIR, exist_ok=True)

def train_price_model():
    print("=" * 70)
    print("TRAINING PRICE PREDICTION MODEL")
    print("=" * 70)
    
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} records from crop_prices.csv.")

    # Target: Modal Price (Rs/kg)
    # Features: State, District, Crops
    target_col = "Modal Price (Rs/kg)"
    feature_cols = ["State", "District", "Crops"]
    
    # Clean data
    df = df.dropna(subset=[target_col] + feature_cols)
    
    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), feature_cols)
        ]
    )

    pipe = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
    ])

    print("Fitting model...")
    pipe.fit(X_train, y_train)

    print("Evaluating...")
    y_pred = pipe.predict(X_test)
    
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)

    print(f"Test R2 Score: {r2:.4f}")
    print(f"Test MAE: {mae:.2f} Rs/kg")

    model_filename = "price_model.joblib"
    metrics_filename = "price_metrics.json"

    joblib.dump(pipe, os.path.join(MODEL_DIR, model_filename))
    joblib.dump(pipe, os.path.join(AI_SERVICE_MODEL_DIR, model_filename))
    print("Model saved to ml/models and ai-service/models.")

    metrics = {
        "model": "RandomForestRegressor",
        "r2_score": float(r2),
        "mae_rs_per_kg": float(mae),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "supported_states": sorted(df['State'].unique().tolist()),
        "supported_crops": sorted(df['Crops'].unique().tolist()),
        "last_trained_at": datetime.now().isoformat()
    }

    with open(os.path.join(MODEL_DIR, metrics_filename), "w") as f:
        json.dump(metrics, f, indent=2)

if __name__ == "__main__":
    train_price_model()
