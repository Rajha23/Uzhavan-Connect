import pandas as pd
import json
import os
import re

json_path = "../data/crop_calendar_master.json"
csv_path = "../data/extracted_media_1790049054331.pdf.csv"

# Load JSON
with open(json_path, 'r', encoding='utf-8') as f:
    master_data = json.load(f)

# Load CSV
df = pd.read_csv(csv_path)
df = df.fillna('')

def extract_days(text):
    if not text:
        return 0, 0
    nums = re.findall(r'\d+', str(text))
    if len(nums) == 0:
        return 0, 0
    elif len(nums) == 1:
        return int(nums[0]), int(nums[0])
    else:
        return int(nums[0]), int(nums[1])

for _, row in df.iterrows():
    crop_name = str(row.get('Crop', ''))
    if not crop_name:
        continue
    
    # Try to find existing
    existing = next((item for item in master_data if item['crop_name'].lower() == crop_name.lower()), None)
    
    min_days, max_days = extract_days(row.get('First harvest / maturity', ''))
    
    if existing:
        existing['category'] = row.get('Type', existing.get('category'))
        existing['season'] = row.get('Main season', existing.get('season'))
        existing['first_harvest_days_min'] = min_days or existing.get('first_harvest_days_min')
        existing['first_harvest_days_max'] = max_days or existing.get('first_harvest_days_max')
        existing['harvest_type'] = row.get('Harvest pattern', existing.get('harvest_type'))
        existing['harvest_period'] = row.get('Harvest period', existing.get('harvest_period'))
        existing['water_requirement'] = row.get('Water', existing.get('water_requirement'))
        existing['soil_type'] = row.get('Soil', existing.get('soil_type'))
        existing['pests'] = row.get('Major pests', existing.get('pests'))
        existing['diseases'] = row.get('Major diseases', existing.get('diseases'))
    else:
        # Create new
        new_entry = {
            "crop_id": "crop_" + crop_name.lower().replace(' ', '_').replace('/', '_'),
            "crop_name": crop_name,
            "category": row.get('Type', ''),
            "season": row.get('Main season', ''),
            "sowing_window": "",
            "crop_duration_days": max_days,
            "first_harvest_days": row.get('First harvest / maturity', ''),
            "first_harvest_days_min": min_days,
            "first_harvest_days_max": max_days,
            "harvest_interval_days": None,
            "harvest_type": row.get('Harvest pattern', ''),
            "harvest_period": row.get('Harvest period', ''),
            "water_requirement": row.get('Water', ''),
            "soil_type": row.get('Soil', ''),
            "temperature_range": "",
            "pests": row.get('Major pests', ''),
            "diseases": row.get('Major diseases', '')
        }
        master_data.append(new_entry)

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(master_data, f, indent=2)

# Also update ai-service
ai_json_path = "../../ai-service/crop_calendar_master.json"
if os.path.exists(ai_json_path):
    with open(ai_json_path, 'w', encoding='utf-8') as f:
        json.dump(master_data, f, indent=2)

print("Updated crop_calendar_master.json successfully.")
