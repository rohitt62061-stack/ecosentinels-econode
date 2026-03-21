import os
import time
import random
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Load Environment Variables from client/.env
dotenv_path = os.path.join(os.path.dirname(__file__), 'client', '.env')
load_dotenv(dotenv_path)

supabase_url = os.environ.get("VITE_SUPABASE_URL")
# Use VITE_SUPABASE_ANON_KEY which has INSERT RLS permission enabled
supabase_key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Supabase URL or Key missing in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

# 2. Hardcoded Bin Static Setup Configs
BIN_COUNT = 20
WASTE_TYPES = (
    ["biodegradable"] * 7 + 
    ["recyclable"] * 7 + 
    ["hazardous"] * 6
)

bins_state = []

def init_bins():
    print("Fetching ward IDs from Supabase...")
    try:
        response = supabase.table("wards").select("id").execute()
        wards = response.data
        if not wards:
            raise ValueError("No wards found in database to map bins to!")
        
        ward_ids = [w['id'] for w in wards]
        print(f"Found {len(ward_ids)} wards. Distributing bins...")

        for i in range(1, BIN_COUNT + 1):
            bin_id = f"BIN_{i:03d}"
            ward_id = ward_ids[(i - 1) % len(ward_ids)] # Distribute evenly
            
            # coords around Delhi: 28.5–28.7 lat, 77.1–77.3 lng
            lat = round(random.uniform(28.5, 28.7), 6)
            lng = round(random.uniform(77.1, 77.3), 6)
            waste_type = WASTE_TYPES[i - 1]

            bins_state.append({
                "bin_id": bin_id,
                "ward_id": ward_id,
                "latitude": lat,
                "longitude": lng,
                "waste_type_detected": waste_type,
                "fill_level_pct": random.uniform(5, 50), # Start random
                "battery_level": random.uniform(85, 100)
            })

        print("Bins initialized successfully!")
    except Exception as e:
        print(f"Initialization error: {e}")
        time.sleep(10)
        init_bins()

def run_simulation_cycle(cycle_number):
    print(f"\n--- Cycle [{cycle_number}] starting at {datetime.now().strftime('%H:%M:%S')} ---")
    
    updated_rows = []
    for bin_obj in bins_state:
        # 1. Update Fill level: +2% to +8%
        bin_obj["fill_level_pct"] += random.uniform(2, 8)
        if bin_obj["fill_level_pct"] >= 100:
            print(f"[{bin_obj['bin_id']}] reached 100%! Resetting to 5% (emptied).")
            bin_obj["fill_level_pct"] = 5.0
            
        # 2. Decrease Battery: -0.1%
        bin_obj["battery_level"] -= 0.1
        if bin_obj["battery_level"] < 5 or random.random() < 0.05: # Recharge trigger
            bin_obj["battery_level"] = 100.0

        updated_rows.append({
            "bin_id": bin_obj["bin_id"],
            "ward_id": bin_obj["ward_id"],
            "latitude": bin_obj["latitude"],
            "longitude": bin_obj["longitude"],
            "waste_type_detected": bin_obj["waste_type_detected"],
            "fill_level_pct": round(bin_obj["fill_level_pct"], 1),
            "battery_level": round(bin_obj["battery_level"], 1),
            "recorded_at": datetime.utcnow().isoformat()
        })

    try:
        # Multi-row INSERT
        response = supabase.table("iot_sensor_readings").insert(updated_rows).execute()
        print(f"Cycle [{cycle_number}] — {len(updated_rows)} bins updated at {datetime.now().strftime('%H:%M:%S')}")
    except Exception as e:
        print(f"Supabase Insert Error in Cycle [{cycle_number}]: {e}")
        print("Retrying in 30 seconds...")
        time.sleep(30)
        run_simulation_cycle(cycle_number) # Retry logic

if __name__ == "__main__":
    init_bins()
    cycle = 1
    while True:
        run_simulation_cycle(cycle)
        cycle += 1
        # Sleep for 5 minutes (300 seconds)
        time.sleep(300)
