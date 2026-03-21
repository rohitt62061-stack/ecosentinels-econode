import os
import time
import requests
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from sklearn.ensemble import RandomForestClassifier
import joblib
from threading import Thread
from datetime import datetime

# 1. Load Setup Configs
load_dotenv()
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY missing in .env")

supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI(title="Source Detection Service", version="1.0.0")

# Model state
model = None
MODEL_PATH = "models/source_detector.pkl"

class ReadingRow(BaseModel):
    id: Optional[str] = None
    ward_id: str
    aqi_value: float
    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    wind_speed: float
    recorded_at: Optional[str] = None

class OptimizeRequest(BaseModel):
    ward_id: str
    truck_count: int

# Synthetic Training Generator
def generate_synthetic_data(samples=5000):
    print("Generating synthetic training data for source detection...")
    data = []
    sources = ['construction_dust', 'biomass_burning', 'vehicle_exhaust', 'industrial', 'unknown']
    
    for _ in range(samples):
        source = np.random.choice(sources, p=[0.2, 0.2, 0.2, 0.2, 0.2])
        hour = np.random.randint(0, 24)
        day_of_week = np.random.randint(0, 7)
        
        # Defaults
        pm25 = np.random.uniform(20, 150)
        pm10 = np.random.uniform(40, 250)
        no2 = np.random.uniform(10, 80)
        so2 = np.random.uniform(5, 50)
        co = np.random.uniform(0.5, 3.5)
        wind_speed = np.random.uniform(1, 10)
        aqi_value = np.random.uniform(50, 250)

        if source == 'construction_dust':
            pm10 = np.random.uniform(120, 280)
            pm25 = pm10 * np.random.uniform(0.3, 0.44)
            co = np.random.uniform(0.3, 0.9)
        elif source == 'biomass_burning':
            pm25 = np.random.uniform(100, 250)
            pm10 = pm25 * np.random.uniform(1.1, 1.3)
            co = np.random.uniform(2.1, 4.0)
            hour = np.random.choice([16, 17, 18, 19, 20])
        elif source == 'vehicle_exhaust':
            no2 = np.random.uniform(45, 100)
            pm25 = pm10 * np.random.uniform(0.5, 0.7)
            hour = np.random.choice([7,8,9, 17,18,19])
        elif source == 'industrial':
            so2 = np.random.uniform(26, 60)
            no2 = np.random.uniform(35, 75)
            hour = np.random.randint(8, 16)
            
        pm_ratio = pm25 / pm10 if pm10 > 0 else 0
        no2_so2_ratio = no2 / so2 if so2 > 0 else 0

        data.append([
            pm_ratio, no2_so2_ratio, aqi_value, wind_speed, hour, day_of_week,
            pm25, pm10, no2, so2, co, source
        ])

    columns = ['pm_ratio', 'no2_so2_ratio', 'aqi_value', 'wind_speed', 'hour', 'day_of_week', 'pm25', 'pm10', 'no2', 'so2', 'co', 'source']
    df = pd.DataFrame(data, columns=columns)
    return df

def train_model():
    global model
    df = generate_synthetic_data()
    X = df.drop(columns=['source'])
    y = df['source']
    
    clf = RandomForestClassifier(n_estimators=200, random_state=42)
    clf.fit(X, y)
    
    os.makedirs("models", exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    model = clf
    print("RandomForest source detection model trained successfully!")

# Load or Train on startup
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
else:
    train_model()

@app.get("/health")
def health():
    return {"status": "ok"}

def predict_single(row: ReadingRow):
    pm_ratio = row.pm25 / row.pm10 if row.pm10 > 0 else 0
    no2_so2_ratio = row.no2 / row.so2 if row.so2 > 0 else 0
    
    # Parse hour/day from recorded_at if passed, else local current
    dt = datetime.utcnow()
    if row.recorded_at:
         try: dt = datetime.fromisoformat(row.recorded_at.replace('Z', '')) 
         except: pass
         
    hour = dt.hour
    day = dt.weekday()

    features = [
        pm_ratio, no2_so2_ratio, row.aqi_value, row.wind_speed,
        hour, day, row.pm25, row.pm10, row.no2, row.so2, row.co
    ]

    X = np.array([features])
    source = model.predict(X)[0]
    probs = model.predict_proba(X)[0]
    confidence = float(np.max(probs))

    return {
        "source_type": source,
        "confidence": confidence,
        "features_used": {
            "pm_ratio": round(pm_ratio, 2),
            "no2_so2_ratio": round(no2_so2_ratio, 2)
        }
    }

@app.post("/detect")
def detect_source(row: ReadingRow):
    return predict_single(row)

@app.post("/detect-batch")
def detect_batch(rows: List[ReadingRow]):
    results = []
    for r in rows:
        results.append(predict_single(r))
    return results

@app.post("/optimize-routes")
def optimize_routes(req: OptimizeRequest):
    try:
        # 1. Fetch overflowing bins (>70%)
        response = supabase.table("iot_sensor_readings")\
            .select("bin_id, latitude, longitude, fill_level_pct")\
            .eq("ward_id", req.ward_id)\
            .gt("fill_level_pct", 70)\
            .execute()
        
        bins = response.data
        if not bins:
             return {"message": "No full bins needing collection found triggers setups locations."}

        # 2. Format Coordinates for OSRM v1: lon,lat;lon,lat;...
        # Let's assume a starting point depot at centroid of wards mapping setups framing configs.
        depot = "77.2167,28.6667" # Sample Delhi Depot center logic setup formulations setups.
        coords_str = depot
        for b in bins:
             coords_str += f";{b['longitude']},{b['latitude']}"

        # 3. Call OSRM
        osrm_url = f"http://router.project-osrm.org/optimize/v1/driving/{coords_str}?steps=false"
        res = requests.get(osrm_url)
        dist = 0
        waypoints = []

        if res.status_code == 200:
             # Option: fallback to route endpoint if optimize requires specific plugin sets
             data = res.json()
             dist = data.get('trips', [{}])[0].get('distance', 0) / 1000.0 # to km
             waypoints = data.get('waypoints', [])
        else:
             # Fallback simple route mapping distance
             route_url = f"http://router.project-osrm.org/route/v1/driving/{coords_str}?overview=false"
             res2 = requests.get(route_url)
             data = res2.json()
             dist = data.get('routes', [{}])[0].get('distance', 0) / 1000.0

        # Saved emissions logic (60km fixed - optimized_km) * 0.22kg/km setup references setups.
        fixed_km = 60.0
        emissions_saved = max(0, (fixed_km - dist) * 0.22)

        result = {
            "ward_id": req.ward_id,
            "dist_km": round(dist, 2),
            "emissions_saved_kg_co2": round(emissions_saved, 2),
            "bins_collected": len(bins),
            "waypoints": len(waypoints)
        }

        # Save to fleet_routes table
        supabase.table("fleet_routes").insert({
            "ward_id": req.ward_id,
            "route_geometry": coords_str,
            "total_distance_km": round(dist, 2),
            "collection_efficiency": round(100 - (dist / fixed_km * 100), 1) if dist < fixed_km else 0
        }).execute()

        return result

    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

# Background Worker Thread Every 30 Min
def cron_worker():
    while True:
        try:
             print("Background ML Cron running: triggering detect-batch on latest AQI...")
             # Fetch latest readings for ALL wards
             response = supabase.table("aqi_readings")\
                  .select("*")\
                  .order("recorded_at", desc=True)\
                  .limit(10)\
                  .execute()
             
             rows = response.data
             for r in rows:
                  res = predict_single(ReadingRow(**r))
                  if res['confidence'] > 0.7:
                       supabase.table("pollution_detections").insert({
                            "ward_id": r['ward_id'],
                            "source_type": res['source_type'],
                            "confidence_pct": int(res['confidence'] * 100),
                            "policy_triggered": True
                       }).execute()

        except Exception as e:
             print(f"Cron Worker Error: {e}")
        
        # Sleep 30 min
        time.sleep(1800)

Thread(target=cron_worker, daemon=True).start()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
