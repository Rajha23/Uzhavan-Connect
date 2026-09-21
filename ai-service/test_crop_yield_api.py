import os
import pytest
from fastapi.testclient import TestClient
from main import app
from crop_yield_predictor import yield_predictor

client = TestClient(app)

def test_health_check():
    """Verify health endpoint shows crop yield model loaded."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "UP"
    assert data["crop_yield_model_loaded"] is True

def test_crop_yield_metadata():
    """Verify metadata endpoint returns 55 supported crops and 30 states."""
    response = client.get("/api/ml/crop-yield/meta")
    assert response.status_code == 200
    data = response.json()
    assert "supported_crops" in data
    assert len(data["supported_crops"]) == 55
    assert "Rice" in data["supported_crops"]
    assert "Wheat" in data["supported_crops"]
    assert "Sugarcane" in data["supported_crops"]
    assert len(data["supported_states"]) == 30
    assert "Tamil Nadu" in data["supported_states"]

def test_valid_prediction():
    """Verify authentic ML model yield prediction for valid input."""
    payload = {
        "crop": "Rice",
        "season": "Kharif",
        "state": "Tamil Nadu",
        "area": 2.5,
        "annual_rainfall": 950.0,
        "fertilizer": 120.0,
        "pesticide": 15.0,
        "crop_year": 2026
    }
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["crop"] == "Rice"
    assert data["predicted_yield"] > 0
    assert data["unit"] == "Tonnes / Hectare"
    assert data["model"] == "Random Forest Regressor"
    assert "estimated_total_production" in data
    assert data["estimated_total_production"] > 0
    assert "model_performance" in data
    assert data["model_performance"]["r2_score"] > 0.90
    assert "explainability" in data
    assert len(data["explainability"]["factors_considered"]) > 0

def test_unknown_crop():
    """Verify unsupported crop gracefully returns friendly validation error."""
    payload = {
        "crop": "Tomato",
        "season": "Kharif",
        "state": "Tamil Nadu",
        "area": 2.5,
        "annual_rainfall": 950.0,
        "fertilizer": 120.0,
        "pesticide": 15.0
    }
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert any("Unsupported Crop: 'Tomato'" in err for err in data["errors"])

def test_unknown_state():
    """Verify unsupported state returns clear error message."""
    payload = {
        "crop": "Rice",
        "season": "Kharif",
        "state": "Atlantis",
        "area": 2.5,
        "annual_rainfall": 950.0,
        "fertilizer": 120.0,
        "pesticide": 15.0
    }
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert any("Unsupported State" in err for err in data["errors"])

def test_invalid_area():
    """Verify non-positive area is caught and rejected."""
    payload = {
        "crop": "Rice",
        "season": "Kharif",
        "state": "Tamil Nadu",
        "area": -5.0,
        "annual_rainfall": 950.0,
        "fertilizer": 120.0,
        "pesticide": 15.0
    }
    # FastAPI pydantic validator gt=0 rejects with 422
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code in [200, 422]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is False
        assert any("Area must be a positive number" in err for err in data["errors"])

def test_negative_fertilizer():
    """Verify negative fertilizer amount is rejected."""
    payload = {
        "crop": "Wheat",
        "season": "Rabi",
        "state": "Punjab",
        "area": 3.0,
        "annual_rainfall": 600.0,
        "fertilizer": -50.0,
        "pesticide": 10.0
    }
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code in [200, 422]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is False
        assert any("Fertilizer amount cannot be negative" in err for err in data["errors"])

def test_negative_pesticide():
    """Verify negative pesticide amount is rejected."""
    payload = {
        "crop": "Wheat",
        "season": "Rabi",
        "state": "Punjab",
        "area": 3.0,
        "annual_rainfall": 600.0,
        "fertilizer": 50.0,
        "pesticide": -10.0
    }
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code in [200, 422]
    if response.status_code == 200:
        data = response.json()
        assert data["success"] is False
        assert any("Pesticide amount cannot be negative" in err for err in data["errors"])

def test_missing_crop():
    """Verify missing crop triggers error."""
    payload = {
        "crop": "",
        "season": "Kharif",
        "state": "Tamil Nadu",
        "area": 2.5,
        "annual_rainfall": 950.0,
        "fertilizer": 120.0,
        "pesticide": 15.0
    }
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert any("Crop is mandatory" in err for err in data["errors"])

def test_missing_season():
    """Verify missing season triggers error."""
    payload = {
        "crop": "Rice",
        "season": "",
        "state": "Tamil Nadu",
        "area": 2.5,
        "annual_rainfall": 950.0,
        "fertilizer": 120.0,
        "pesticide": 15.0
    }
    response = client.post("/api/ml/crop-yield/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert any("Season is mandatory" in err for err in data["errors"])

def test_ml_artifacts_exist():
    """Verify training generated both model pkl and metrics json."""
    base_dir = os.path.dirname(__file__)
    pkl_path = os.path.join(base_dir, "models", "crop_yield_model.pkl")
    json_path = os.path.join(base_dir, "models", "training_metrics.json")
    assert os.path.exists(pkl_path)
    assert os.path.getsize(pkl_path) > 1000000
    assert os.path.exists(json_path)
