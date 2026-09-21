"""
Pytest Test Suite - Crop Harvest Forecasting Engine
Tests the CropHarvestEngine against the Uzhavan Connect Crop Calendar Database.

Test cases:
1. Tomato (Repeated, 60-80 days, ~3.5 days interval, multiple pickings)
2. Okra / Ladies Finger (Repeated, 45-60 days, ~2 days interval)
3. Rice / Paddy (One-time, 90-150 days, NO repeated pickings)
4. French Beans (Repeated, 45-60 days, ~2.5 days interval)
5. Observation ingestion and schema validation

Run: python -m pytest ai-service/test_crop_harvest.py -v
"""

import sys
import os
import pytest
from datetime import datetime, timedelta

# Ensure ai-service is in path for test runner
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crop_harvest_engine import CropHarvestEngine


# ─── Fixture: fresh engine per test session ────────────────────────────────

@pytest.fixture(scope="session")
def engine():
    e = CropHarvestEngine()
    assert len(e.crops_db) > 0, "Crop Calendar Database must have at least one entry loaded"
    return e


# ─── Test 1: Tomato (Repeated harvest crop) ───────────────────────────────

def test_tomato_repeated_harvest(engine: CropHarvestEngine):
    """
    Tomato: Repeated harvest crop.
    Expected first harvest: 60-80 days from sowing.
    Harvest interval: ~3.5 days (displayed as '3-4 days').
    Picking schedule must be generated (non-empty).
    """
    sowing_date = "2026-07-01"
    result = engine.forecast_harvest(
        crop="Tomato",
        sowing_date=sowing_date,
        variety="Arka Rakshak",
        location="Salem",
        soil_type="Well-drained loam",
        irrigation="Borewell Drip Irrigation (Optimized)"
    )

    # Harvest type assertions
    assert result["harvest_type"] == "Repeated", f"Expected 'Repeated', got: {result['harvest_type']}"
    assert result["is_repeated_harvest"] is True

    # Date window assertions (60-80 days with possible micro-adjustments)
    sow_dt = datetime.strptime(sowing_date, "%Y-%m-%d")
    first_harvest_dt = datetime.strptime(result["expected_first_harvest_date"], "%Y-%m-%d")
    days_to_first = (first_harvest_dt - sow_dt).days

    assert 55 <= days_to_first <= 85, (
        f"Tomato first harvest expected in 55-85 days (adj.), got {days_to_first} days"
    )

    # Interval assertion
    assert result["harvest_interval_days"] is not None, "Harvest interval must not be None for repeated crop"
    assert 3 <= result["harvest_interval_days"] <= 4, (
        f"Tomato interval expected 3.5 (3-4 days range), got {result['harvest_interval_days']}"
    )

    # Picking schedule must be non-empty
    assert len(result["subsequent_pickings"]) > 0, "Tomato must have a non-empty picking schedule"
    assert result["subsequent_pickings"][0]["pick_number"] == 1
    assert "First marketable flush" in result["subsequent_pickings"][0]["stage"]

    # Plant protection data
    assert result["pests"], "Pests field must be populated"
    assert result["diseases"], "Diseases field must be populated"

    print(f"\n✅ Tomato: first harvest {result['expected_first_harvest_formatted']}, "
          f"interval {result['harvest_interval']}, "
          f"{len(result['subsequent_pickings'])} pickings generated")


# ─── Test 2: Okra / Ladies Finger (Repeated, ~2 days interval) ────────────

def test_okra_repeated_harvest(engine: CropHarvestEngine):
    """
    Ladies Finger / Okra: Repeated harvest crop.
    Expected first harvest: 45-60 days.
    Harvest interval: 2 days (every 2 days picking cadence).
    """
    sowing_date = "2026-06-15"
    result = engine.forecast_harvest(
        crop="Ladies Finger/Okra",
        sowing_date=sowing_date,
        location="Madurai",
        soil_type="Fertile well-drained soil",
        irrigation="Borewell Drip Irrigation (Optimized)"
    )

    assert result["harvest_type"] in ["Repeated", "Multiple pickings"]
    assert result["is_repeated_harvest"] is True

    sow_dt = datetime.strptime(sowing_date, "%Y-%m-%d")
    first_dt = datetime.strptime(result["expected_first_harvest_date"], "%Y-%m-%d")
    days_to_first = (first_dt - sow_dt).days

    assert 40 <= days_to_first <= 70, (
        f"Okra first harvest expected ~45-60 days, got {days_to_first} days"
    )

    assert result["harvest_interval_days"] == 2, (
        f"Okra interval expected 2 days, got {result['harvest_interval_days']}"
    )

    assert len(result["subsequent_pickings"]) > 0, "Okra must generate picking schedule"

    print(f"\n✅ Okra: first harvest {result['expected_first_harvest_formatted']}, "
          f"interval every 2 days, "
          f"{len(result['subsequent_pickings'])} pickings generated")


# ─── Test 3: Rice / Paddy (One-time, NO repeated pickings) ────────────────

def test_rice_one_time_no_pickings(engine: CropHarvestEngine):
    """
    Rice / Paddy: One-time harvest crop.
    Expected first harvest: 90-150 days from sowing.
    STRICTLY no repeated pickings must be generated.
    """
    sowing_date = "2026-06-15"
    result = engine.forecast_harvest(
        crop="Rice/Paddy",
        sowing_date=sowing_date,
        variety="Co-51",
        location="Thanjavur",
        soil_type="Clay/loam",
        irrigation="Canal / River Basin Flow"
    )

    # One-time harvest type
    assert result["harvest_type"] == "One-time", f"Expected 'One-time', got: {result['harvest_type']}"
    assert result["is_repeated_harvest"] is False

    # STRICTLY no repeated pickings
    assert result["subsequent_pickings"] == [], (
        f"Rice/Paddy must have EMPTY picking schedule. Got {len(result['subsequent_pickings'])} picks."
    )

    # Date window (90-150 days with adjustments)
    sow_dt = datetime.strptime(sowing_date, "%Y-%m-%d")
    first_dt = datetime.strptime(result["expected_first_harvest_date"], "%Y-%m-%d")
    days_to_first = (first_dt - sow_dt).days

    assert 85 <= days_to_first <= 155, (
        f"Rice first harvest expected 90-150 days, got {days_to_first} days"
    )

    # Interval text must indicate one-time
    assert "one-time" in result["harvest_interval"].lower() or "single" in result["harvest_interval"].lower(), (
        f"Harvest interval text must indicate one-time: got '{result['harvest_interval']}'"
    )

    print(f"\n✅ Rice/Paddy: first harvest {result['expected_first_harvest_formatted']}, "
          f"type One-time, 0 pickings (correct)")


# ─── Test 4: French Beans (Repeated, ~2.5 days interval) ──────────────────

def test_french_beans_repeated_harvest(engine: CropHarvestEngine):
    """
    French Beans: Repeated harvest crop.
    Expected first harvest: 45-60 days.
    Harvest interval: ~2.5 days.
    Picking schedule must be generated.
    """
    sowing_date = "2026-09-01"
    result = engine.forecast_harvest(
        crop="French Beans",
        sowing_date=sowing_date,
        location="Dindigul",
        soil_type="Well-drained loam",
        irrigation="Borewell Drip Irrigation (Optimized)"
    )

    assert result["harvest_type"] in ["Repeated", "Multiple pickings"]
    assert result["is_repeated_harvest"] is True

    sow_dt = datetime.strptime(sowing_date, "%Y-%m-%d")
    first_dt = datetime.strptime(result["expected_first_harvest_date"], "%Y-%m-%d")
    days_to_first = (first_dt - sow_dt).days

    assert 40 <= days_to_first <= 70, (
        f"French Beans first harvest expected ~45-60 days, got {days_to_first} days"
    )

    assert result["harvest_interval_days"] is not None
    assert 2 <= result["harvest_interval_days"] <= 3, (
        f"French Beans interval expected ~2.5 days, got {result['harvest_interval_days']}"
    )

    assert len(result["subsequent_pickings"]) > 0, "French Beans must generate picking schedule"

    print(f"\n✅ French Beans: first harvest {result['expected_first_harvest_formatted']}, "
          f"interval {result['harvest_interval']}, "
          f"{len(result['subsequent_pickings'])} pickings")


# ─── Test 5: Observation ingestion & schema validation ───────────────────

def test_observation_ingestion(engine: CropHarvestEngine, tmp_path, monkeypatch):
    """
    Verifies that a valid farm harvest observation can be ingested
    and recorded without error, and that missing required fields
    raise ValueError.
    """
    import crop_harvest_engine as engine_module

    # Redirect observations file to temp path for test isolation
    test_obs_path = str(tmp_path / "test_farm_harvest_observations.csv")
    monkeypatch.setattr(engine_module, "OBSERVATIONS_PATH", test_obs_path)

    valid_obs = {
        "crop": "Tomato",
        "variety": "Arka Rakshak",
        "location": "Salem",
        "sowing_date": "2026-07-01",
        "actual_first_harvest_date": "2026-09-08",
        "actual_final_harvest_date": "2026-11-15",
        "soil_type": "Well-drained loam",
        "irrigation": "Borewell Drip Irrigation (Optimized)",
        "rainfall": 285.0,
        "temperature": 29.1,
        "humidity": 64.0,
        "farm_area": 0.8,
        "historical_yield": 23.5
    }

    result = engine.record_farm_observation(valid_obs)
    assert result["status"] == "RECORDED"
    assert result["observation"]["crop"] == "Tomato"
    assert result["observation"]["actual_first_harvest_date"] == "2026-09-08"

    # Verify CSV was written
    assert os.path.exists(test_obs_path), "Observations CSV must have been created"

    # Schema validation — missing required field must raise ValueError
    incomplete_obs = {
        "crop": "Tomato",
        "location": "Salem",
        "sowing_date": "2026-07-01"
        # actual_first_harvest_date is missing
    }
    with pytest.raises(ValueError, match="actual_first_harvest_date"):
        engine.record_farm_observation(incomplete_obs)

    print(f"\n✅ Observation ingested successfully to {test_obs_path}")
    print(f"   Required-field validation raises ValueError correctly")


# ─── Test 6: Unknown crop raises ValueError ───────────────────────────────

def test_unknown_crop_raises_error(engine: CropHarvestEngine):
    """
    Querying a completely unknown crop should raise ValueError with a clear message.
    """
    with pytest.raises(ValueError, match="not found"):
        engine.forecast_harvest(crop="XYZ_NonExistent_Crop_9999", sowing_date="2026-07-01")

    print(f"\n✅ Unknown crop raises ValueError with clear message (correct)")


# ─── Test 7: Alternate crop aliases ──────────────────────────────────────

def test_crop_alias_okra(engine: CropHarvestEngine):
    """
    'Okra' and 'bhendi' are aliases for 'Ladies Finger/Okra' — should resolve correctly.
    """
    result_okra = engine.forecast_harvest(crop="okra", sowing_date="2026-07-01")
    result_bhendi = engine.forecast_harvest(crop="bhendi", sowing_date="2026-07-01")

    assert result_okra["crop"].lower().replace("/", "").replace(" ", "") in ["ladiesfingersokra", "ladiesfingerokra", "okra"]
    assert result_bhendi["crop"] == result_okra["crop"]

    print(f"\n✅ Alias 'okra'→'{result_okra['crop']}', 'bhendi'→'{result_bhendi['crop']}' resolved correctly")
