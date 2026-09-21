from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from demand_forecaster import forecaster
from route_optimizer import route_optimizer

from crop_yield_predictor import yield_predictor

app = FastAPI(
    title="AgriPulse AI & Optimization Service",
    description="Microservice providing XGBoost/ML Demand Forecasting, Crop Yield Prediction, and Google OR-Tools Route Optimization for Uzhavan Connect",
    version="1.1.0"
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

@app.get("/")
def root():
    return {
        "service": "AgriPulse AI & Optimization Microservice",
        "status": "ONLINE",
        "version": "1.1.0",
        "endpoints": [
            "/api/forecasts/predict",
            "/api/routes/optimize",
            "/api/ml/crop-yield/predict",
            "/api/ml/crop-yield/meta",
            "/health"
        ]
    }

@app.get("/health")
def health():
    return {
        "status": "UP",
        "forecast_model_loaded": True,
        "crop_yield_model_loaded": yield_predictor.model_loaded,
        "models_loaded": yield_predictor.model_loaded
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

