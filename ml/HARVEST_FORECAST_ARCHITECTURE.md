# Harvest Forecast & Calendar Intelligence — Architecture

**Module**: Uzhavan Connect Crop Harvest Forecasting Module  
**Version**: 1.0.0  
**Source Authority**: `Uzhavan_Connect_Crop_Details_Database.pdf` (59 crops, South India agro-climates)

---

## Overview

The Crop Harvest Forecasting module uses a **two-layer intelligence architecture** that separates
agronomic calendar references from empirical machine learning, ensuring:

- **Transparency**: Farmers understand what is a reference value vs. ML prediction.
- **Reliability**: Works offline using crop calendar data even without the ai-service.
- **Extensibility**: Farm-level observations feed a continuously improving supervised ML model.

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                   UZHAVAN CONNECT FRONTEND                     │
│                                                               │
│  CropHarvestForecastPage.tsx (Full-screen page)               │
│     └── CropHarvestForecasterCard.tsx                         │
│           ├── cropHarvestService.ts  ─── API call ──────────┐ │
│           │     └── Offline fallback (cropCalendarMaster.ts) │ │
│           └── taskService.ts (Add to Task Management)        │ │
│                                                               │ │
│  FarmerDashboard.tsx                                          │ │
│     ├── Quick Operation: "Harvest Forecast" button            │ │
│     └── Toggleable <CropHarvestForecasterCard />              │ │
│                                                               │ │
│  Sidebar.tsx: FARMER → "Harvest Forecast" (CalendarDays icon) │ │
│  App.tsx: 'harvest-forecast' | 'crop-harvest-forecast' routes │ │
└──────────────────────────────────────────────────────────────┼─┘
                                                               │
                    HTTP (FastAPI ai-service)                   │
                                                               │
┌──────────────────────────────────────────────────────────────▼─┐
│                  AI-SERVICE (FastAPI, port 8000)                │
│                                                               │
│  POST /api/ml/harvest/forecast                                │
│  GET  /api/ml/harvest/crops                                   │
│  POST /api/ml/harvest/record-observation                      │
│  GET  /api/ml/harvest/observations-schema                     │
│                                                               │
│       ┌────────────────────────────────────┐                 │
│       │         CropHarvestEngine          │                 │
│       │  ┌──────────────────────────────┐  │                 │
│       │  │  Layer 1: Crop Calendar      │  │                 │
│       │  │  crop_calendar_master.json   │  │                 │
│       │  │  (59 crops from PDF)         │  │                 │
│       │  │                              │  │                 │
│       │  │  • first_harvest_days_min/max│  │                 │
│       │  │  • harvest_type              │  │                 │
│       │  │  • harvest_interval_days     │  │                 │
│       │  │  • pests / diseases          │  │                 │
│       │  │  • temperature/soil adjust   │  │                 │
│       │  └──────────────────────────────┘  │                 │
│       │  ┌──────────────────────────────┐  │                 │
│       │  │  Layer 2: Farm ML Model      │  │                 │
│       │  │  models/farm_harvest_model   │  │                 │
│       │  │  (Optional, when trained)    │  │                 │
│       │  │                              │  │                 │
│       │  │  • Trained on observations   │  │                 │
│       │  │  • Random Forest / GBM       │  │                 │
│       │  │  • Reports cv_mae_days       │  │                 │
│       │  └──────────────────────────────┘  │                 │
│       └────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                          │                │
                    Reads from        Writes to
                          │                │
┌─────────────────────────▼────────────────▼───────────────────────┐
│                         DATA LAYER                                │
│                                                                  │
│  ai-service/crop_calendar_master.json   (59 crop agronomic ref)  │
│  src/data/cropCalendarMaster.ts         (TypeScript mirror)       │
│  ml/data/farm_harvest_observations.csv  (Empirical records)       │
│  ml/data/farm_harvest_schema.json       (JSON Schema)             │
│  ml/models/farm_harvest_model.joblib    (Trained ML bundle)       │
│  ml/data/farm_harvest_model_metrics.json (Training metrics)       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: Crop Calendar Engine (Rule-Based)

### Source
All 59 crops are extracted verbatim from `Uzhavan_Connect_Crop_Details_Database.pdf`.

### Fields Per Crop

| Field | Type | Description |
|---|---|---|
| `crop_id` | string | Unique identifier (e.g. `crop_tomato`) |
| `crop_name` | string | Display name (e.g. `Tomato`, `Rice/Paddy`) |
| `category` | string | Botanical/use category (Vegetable, Cereal, Pulse…) |
| `season` | string | Sowing seasons for Tamil Nadu |
| `sowing_window` | string | Calendar sowing months |
| `crop_duration_days` | int | Total crop lifecycle in days |
| `first_harvest_days_min` | int | Earliest first harvest from sowing |
| `first_harvest_days_max` | int | Latest first harvest from sowing |
| `harvest_interval_days` | float\|null | Days between repeated pickings (null = One-time) |
| `harvest_type` | enum | `One-time`, `Repeated`, `Multiple pickings` |
| `harvest_period` | string | Human-readable harvest duration |
| `water_requirement` | enum | `Low`, `Moderate`, `High`, `Low–moderate`, `Moderate–high` |
| `soil_type` | string | Optimal soil description |
| `temperature_range` | string | Optimal growing temperature |
| `pests` | string | Major pest threats (from PDF) |
| `diseases` | string | Major disease threats (from PDF) |

### Micro-Adjustment Logic

The engine applies minor calibrations (±3–5%) to the base first-harvest window:

1. **Temperature calibration**: If ambient temp is >3°C above optimal max → accelerates maturity.  
   If >3°C below optimal min → extends vegetative phase.

2. **Soil compatibility**: Sandy soil vs. clay target → slight delay.

3. **Irrigation method**: Drip irrigation → faster establishment.  
   Rainfed → wider uncertainty window.

> These adjustments are clearly attributed in the `adjustments_applied` response field.

### Harvest Type Separation (Critical)

| Harvest Type | Picking Schedule | Use Case |
|---|---|---|
| **One-time** | **Empty `[]`** | Rice, Wheat, Maize, Carrots, Onion, Cabbage |
| **Repeated** | Up to 8 picking dates | Tomato, Okra, Brinjal, Chilli, Cucumber |
| **Multiple pickings** | Up to 8 picking dates | Jasmine, Banana, Grapes |

---

## Layer 2: Supervised Farm ML Model (Optional)

### Training Data: `farm_harvest_observations.csv`

Schema (26+ pilot records from Tamil Nadu agro-climatic zones):

| Column | Type | Description |
|---|---|---|
| `crop` | string | Crop name |
| `variety` | string | Variety/cultivar |
| `location` | string | District name |
| `sowing_date` | date | ISO format |
| `soil_type` | string | Observed soil type |
| `irrigation` | string | Irrigation method used |
| `rainfall` | float | Seasonal rainfall (mm) |
| `temperature` | float | Average temperature (°C) |
| `humidity` | float | Average relative humidity (%) |
| `farm_area` | float | Farm area (hectares) |
| `historical_yield` | float | Observed yield (t/ha) |
| `actual_first_harvest_date` | date | Ground truth first harvest |
| `actual_final_harvest_date` | date | Ground truth final harvest |

### Training Script: `ml/scripts/train_farm_harvest_model.py`

Trains two regressors:
- `model_first_harvest`: Predicts `days_to_first_harvest`
- `model_harvest_duration`: Predicts `harvest_duration_days`

Algorithm: Random Forest / Gradient Boosting (auto-selected via cross-validation).  
Evaluation: MAE, RMSE, R² with 5-fold cross-validation.  
Persistence: `ai-service/models/farm_harvest_model.joblib`

### Activation

The ML model is optional. When loaded, it provides a supplementary `ml_insight` object in the API response:

```json
{
  "ml_insight": {
    "model_type": "Supervised Random Forest (Trained on farm observations)",
    "predicted_days_to_first_harvest": 68.5,
    "ml_expected_date": "2026-09-07",
    "cv_mae_days": 4.2,
    "training_records": 26
  }
}
```

If not loaded, `ml_insight` is `null` — the crop calendar reference values are always the primary output.

---

## API Endpoint Contracts

### `GET /api/ml/harvest/crops`

Lists all 59 crops with agronomic parameters.

**Response:**
```json
{
  "total_crops": 59,
  "source": "Uzhavan Connect Crop Details & Harvest Database",
  "crops": [
    {
      "crop_id": "crop_tomato",
      "crop_name": "Tomato",
      "category": "Vegetable",
      "season": "Kharif, Rabi, Summer",
      "harvest_type": "Repeated",
      "first_harvest_days": "60–80 days",
      "harvest_interval_days": 3.5,
      "soil_type": "Well-drained loam",
      "water_requirement": "Moderate–high"
    }
  ]
}
```

### `POST /api/ml/harvest/forecast`

**Request:**
```json
{
  "crop": "Tomato",
  "sowing_date": "2026-07-01",
  "variety": "Arka Rakshak",
  "location": "Salem",
  "soil_type": "Well-drained loam",
  "irrigation": "Borewell Drip Irrigation (Optimized)",
  "temperature": 29.0,
  "rainfall": 300.0
}
```

**Response (Repeated crop):**
```json
{
  "crop": "Tomato",
  "harvest_type": "Repeated",
  "is_repeated_harvest": true,
  "expected_first_harvest_date": "2026-09-07",
  "first_harvest_window": {
    "start_formatted": "07 Sep 2026",
    "end_formatted": "18 Sep 2026",
    "days_range": "60–80 days from sowing"
  },
  "harvest_interval": "Approximately every 3–4 days",
  "subsequent_pickings": [
    { "pick_number": 1, "formatted_date": "07 Sep 2026", "stage": "First marketable flush" },
    { "pick_number": 2, "formatted_date": "11 Sep 2026", "stage": "Picking Flush #2" }
  ],
  "pests": "Fruit borer, aphids, whiteflies",
  "diseases": "Early blight, late blight, fusarium wilt",
  "disclaimer": "Reference values calibrated from Uzhavan Connect Crop Details & Harvest Database...",
  "ml_insight": null
}
```

**Response (One-time crop — Rice):**
```json
{
  "crop": "Rice/Paddy",
  "harvest_type": "One-time",
  "is_repeated_harvest": false,
  "harvest_interval": "Single main harvest (one-time; no repeated pickings)",
  "subsequent_pickings": []
}
```

### `POST /api/ml/harvest/record-observation`

Records actual farm harvest data for future ML training.

**Required fields:** `crop`, `location`, `sowing_date`, `actual_first_harvest_date`

### `GET /api/ml/harvest/observations-schema`

Returns the formal JSON Schema for the farm observation object.

---

## Existing Module Preservation

> [!IMPORTANT]
> The **Production Crop Yield Prediction Module** (`crop_yield.csv`, Random Forest, R²=0.914) is
> **completely untouched**. All existing endpoints (`/api/ml/crop-yield/predict`, `/api/ml/crop-yield/meta`)
> and their predictors continue operating without modification.

---

## Frontend Integration Points

| File | Change |
|---|---|
| `src/services/cropHarvestService.ts` | Typed API layer + offline fallback |
| `src/components/crop/CropHarvestForecasterCard.tsx` | Main UI component |
| `src/pages/CropHarvestForecastPage.tsx` | Full-screen page with Crop Calendar Browser |
| `src/pages/FarmerDashboard.tsx` | Quick action + inline toggleable card |
| `src/components/Sidebar.tsx` | FARMER nav item (CalendarDays icon) |
| `src/App.tsx` | Routes: `harvest-forecast`, `crop-harvest-forecast` |

---

## Running Tests

```bash
# Harvest forecasting test suite
python -m pytest ai-service/test_crop_harvest.py -v

# Existing yield prediction regression test (must remain green)
python -m pytest ai-service/test_crop_yield_api.py -v

# Frontend TypeScript build
npm run build
```

---

## Farm ML Model Training

Once ≥30 empirical observation records are collected:

```bash
python ml/scripts/train_farm_harvest_model.py
```

The model bundle is saved to `ai-service/models/farm_harvest_model.joblib` and automatically
loaded by `CropHarvestEngine` on the next service restart, enriching forecasts with an optional
`ml_insight` supplementary prediction.
