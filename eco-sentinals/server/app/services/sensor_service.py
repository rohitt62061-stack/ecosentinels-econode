from app.models.sensor import SensorDataCreate
from app.repositories.state_repo import StateRepository
from typing import Dict, Any

class SensorService:
    def __init__(self, state_repo: StateRepository):
        self.state_repo = state_repo

    def calibrate_aqi(self, data: SensorDataCreate) -> int:
        """
        Runs calibration logic on received sensor data.
        In handles ward isolation via the StateRepository.
        """
        # Placeholder Calibration: Tweak PM2.5 based on humidity
        calibrated_pm25 = data.pm25 * (1 + (data.humidity - 50) * 0.01)
        
        # Simple AQI calculation placeholder
        aqi = int(calibrated_pm25 * 3.5)
        
        # Save to state repo isolated by ward_id
        self.state_repo.update_sensor_data(data.ward_id, {
            "pm25": calibrated_pm25,
            "pm10": data.pm10,
            "temp": data.temp,
            "humidity": data.humidity,
            "aqi": aqi
        })
        
        # Automated Alert check (Policy Audit)
        if aqi > 300:
            print(f"[ALERT] Ward {data.ward_id} AQI > 300! Triggering sprinkles.")

        return aqi

def get_sensor_service(state_repo: StateRepository) -> SensorService:
    """Dependency injection provider for SensorService."""
    return SensorService(state_repo)
