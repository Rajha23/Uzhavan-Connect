from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from demand_forecaster import forecaster
from route_optimizer import route_optimizer

from crop_yield_predictor import yield_predictor
from crop_harvest_engine import harvest_engine
from price_predictor import price_predictor

app = FastAPI(
    title="AgriPulse AI & Optimization Service",
    description="Microservice providing XGBoost/ML Demand Forecasting, Crop Yield Prediction, Google OR-Tools Route Optimization, and Crop Harvest Forecasting & Calendar Intelligence for Uzhavan Connect",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ForecastRequest(BaseModel):
    crop: str = Field(default="Tomato", description="Crop name (e.g., Tomato, Onion, Potato)")
    location: str = Field(default="Chennai", description="Target consumption district/city")
    season: Optional[str] = Field(default="Kharif", description="Agricultural cropping season")
    current_price: Optional[float] = Field(default=25.0, description="Current Mandi price in INR/kg")
    days_ahead: Optional[int] = Field(default=7, description="Number of days ahead to forecast")

class RouteRequest(BaseModel):
    shipment_id: Optional[str] = Field(default=None, description="Associated shipment UUID")
    pickup_locations: List[str] = Field(default_factory=list, description="Farm or cluster pickup locations")
    delivery_location: str = Field(default="Koyambedu Wholesale Terminal, Chennai", description="Destination market")
    quantity: float = Field(default=3000.0, description="Payload weight in kg")
    vehicle_capacity: Optional[float] = Field(default=3500.0, description="Max truck capacity in kg")
    collection_center: Optional[str] = Field(default="Chengalpattu Micro-Hub #4", description="Intermediate aggregation hub")

class CropYieldRequest(BaseModel):
    crop: str = Field(default="Rice", description="Crop name (e.g. Rice, Wheat, Sugarcane, Potato, Onion)")
    season: str = Field(default="Kharif", description="Cropping season (e.g. Kharif, Rabi, Summer, Whole Year, Winter, Autumn)")
    state: str = Field(default="Tamil Nadu", description="State name (e.g. Tamil Nadu, Punjab, Karnataka)")
    area: float = Field(default=2.5, description="Cultivated Area in Hectares")
    annual_rainfall: float = Field(default=950.0, description="Annual rainfall in mm")
    fertilizer: float = Field(default=120.0, description="Fertilizer amount in kg")
    pesticide: float = Field(default=15.0, description="Pesticide amount in kg")
    crop_year: Optional[int] = Field(default=2026, description="Cropping year")

class PricePredictionRequest(BaseModel):
    crop: str = Field(default="Wheat", description="Crop name")
    state: str = Field(default="Rajasthan", description="State name")
    district: str = Field(default="Chittorgarh", description="District name")

class HarvestForecastRequest(BaseModel):
    crop: str = Field(description="Crop name (e.g., Tomato, Rice/Paddy, Ladies Finger/Okra)")
    sowing_date: str = Field(description="Sowing date in ISO format YYYY-MM-DD")
    variety: Optional[str] = Field(default=None, description="Variety name (optional)")
    location: Optional[str] = Field(default="Tamil Nadu", description="District or state name")
    season: Optional[str] = Field(default=None, description="Agricultural season")
    soil_type: Optional[str] = Field(default=None, description="Soil type (e.g., Well-drained loam, Clay/loam, Sandy loam)")
    irrigation: Optional[str] = Field(default=None, description="Irrigation method")
    rainfall: Optional[float] = Field(default=None, description="Expected seasonal rainfall in mm")
    temperature: Optional[float] = Field(default=None, description="Average ambient temperature in °C")
    humidity: Optional[float] = Field(default=None, description="Average relative humidity %")

class FarmObservationRequest(BaseModel):
    crop: str = Field(description="Crop name")
    variety: Optional[str] = Field(default=None, description="Variety name")
    location: str = Field(description="Farm district/location")
    sowing_date: str = Field(description="Sowing date YYYY-MM-DD")
    actual_first_harvest_date: str = Field(description="Actual first harvest date YYYY-MM-DD")
    actual_final_harvest_date: Optional[str] = Field(default=None, description="Actual final harvest date YYYY-MM-DD")
    soil_type: Optional[str] = Field(default=None, description="Soil type")
    irrigation: Optional[str] = Field(default=None, description="Irrigation method")
    rainfall: Optional[float] = Field(default=None, description="Seasonal rainfall in mm")
    temperature: Optional[float] = Field(default=None, description="Avg temperature °C")
    humidity: Optional[float] = Field(default=None, description="Avg humidity %")
    farm_area: Optional[float] = Field(default=1.0, description="Farm area in hectares")
    historical_yield: Optional[float] = Field(default=None, description="Yield in tonnes/ha")

@app.get("/")
def root():
    return {
        "service": "AgriPulse AI & Optimization Microservice",
        "status": "ONLINE",
        "version": "1.2.0",
        "endpoints": [
            "/api/forecasts/predict",
            "/api/routes/optimize",
            "/api/ml/crop-yield/predict",
            "/api/ml/crop-yield/meta",
            "/api/ml/harvest/crops",
            "/api/ml/harvest/forecast",
            "/api/ml/harvest/record-observation",
            "/api/ml/harvest/observations-schema",
            "/api/ml/price/predict",
            "/health"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "UP",
        "forecast_model_loaded": True,
        "crop_yield_model_loaded": yield_predictor.model_loaded,
        "harvest_engine_crops_loaded": len(harvest_engine.crops_db),
        "harvest_ml_model_loaded": harvest_engine.ml_bundle is not None,
        "models_loaded": yield_predictor.model_loaded,
        "price_predictor_loaded": price_predictor.is_trained
    }

# ─── Crop Harvest Forecasting & Calendar Intelligence Endpoints ──────────────

@app.get("/api/ml/harvest/crops")
def list_harvest_crops():
    """
    List all 59 crops from the Crop Calendar Master Database
    with categories, harvest types, and agronomic parameters.
    """
    try:
        crops = harvest_engine.get_supported_crops()
        return {
            "total_crops": len(crops),
            "source": "Uzhavan Connect Crop Details & Harvest Database (PDF-derived agronomic reference)",
            "crops": crops
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/harvest/forecast")
def forecast_harvest(req: HarvestForecastRequest):
    """
    Primary harvest prediction endpoint.
    Computes expected first harvest date, harvest window, picking schedule
    (for repeated crops), and plant protection advisories.
    Calendar-derived forecasts are clearly labeled as Agronomic Reference values.
    """
    try:
        result = harvest_engine.forecast_harvest(
            crop=req.crop,
            sowing_date=req.sowing_date,
            variety=req.variety,
            location=req.location or "Tamil Nadu",
            season=req.season,
            soil_type=req.soil_type,
            irrigation=req.irrigation,
            rainfall=req.rainfall,
            temperature=req.temperature,
            humidity=req.humidity
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/harvest/record-observation")
def record_farm_observation(req: FarmObservationRequest):
    """
    Collect real-world farmer harvest observations for supervised ML retraining.
    Records are appended to farm_harvest_observations.csv for future model training.
    """
    try:
        result = harvest_engine.record_farm_observation(req.dict())
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ml/harvest/observations-schema")
def get_observations_schema():
    """
    Expose the farm harvest observation JSON schema for
    mobile/web form validation and API documentation.
    """
    import os, json
    schema_path = os.path.join(os.path.dirname(__file__), "..", "ml", "data", "farm_harvest_schema.json")
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            schema = json.load(f)
        return schema
    except FileNotFoundError:
        return {
            "title": "FarmHarvestObservation",
            "type": "object",
            "required": ["crop", "location", "sowing_date", "actual_first_harvest_date"],
            "note": "Full schema file not found. Required fields listed above."
        }

@app.get("/api/ml/crop-yield/meta")
def crop_yield_metadata():
    return yield_predictor.get_metadata()

@app.post("/api/ml/crop-yield/predict")
@app.post("/api/crop-yield/predict")
def predict_crop_yield(req: CropYieldRequest):
    try:
        result = yield_predictor.predict(
            crop=req.crop,
            season=req.season,
            state=req.state,
            area=req.area,
            annual_rainfall=req.annual_rainfall,
            fertilizer=req.fertilizer,
            pesticide=req.pesticide,
            crop_year=req.crop_year or 2026
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ml/price/predict")
def predict_price(req: PricePredictionRequest):
    try:
        result = price_predictor.predict(
            crop=req.crop,
            state=req.state,
            district=req.district
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/forecasts/predict")
def predict_demand(req: ForecastRequest):
    try:
        result = forecaster.predict(
            crop=req.crop,
            location=req.location,
            season=req.season or "Kharif",
            current_price=req.current_price or 25.0,
            days_ahead=req.days_ahead or 7
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/routes/optimize")
def optimize_route(req: RouteRequest):
    try:
        result = route_optimizer.optimize_route(
            pickup_locations=req.pickup_locations,
            delivery_location=req.delivery_location,
            quantity_kg=req.quantity,
            vehicle_capacity_kg=req.vehicle_capacity or 3500.0,
            collection_center=req.collection_center or "Chengalpattu Micro-Hub #4"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

