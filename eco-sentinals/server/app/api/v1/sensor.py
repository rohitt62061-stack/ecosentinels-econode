from fastapi import APIRouter, Depends, HTTPException, status
from app.models.sensor import SensorDataCreate
from app.services.sensor_service import SensorService
from app.repositories.state_repo import StateRepository, get_state_repo
from app.api.deps import get_current_ward, get_sensor_service

router = APIRouter()

@router.post("/ingest-sensor")
async def ingest_sensor(
    data: SensorDataCreate,
    current_ward: str = Depends(get_current_ward),
    service: SensorService = Depends(get_sensor_service)
):
    """
    Receives sensor data and calibrates AQI.
    Enforces that ingest data matches the authenticated ward_id.
    """
    if data.ward_id != current_ward:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Token is for Ward {current_ward}, but request is for Ward {data.ward_id}"
        )
    
    aqi = service.calibrate_aqi(data)
    return {"status": "success", "calibrated_aqi": aqi, "ward_id": current_ward}

@router.get("/command")
async def get_command(
    current_ward: str = Depends(get_current_ward),
    state_repo: StateRepository = Depends(get_state_repo)
):
    """
    ESP32 polls this to check if it should open the lid.
    Returns command isolated to the authenticated ward_id.
    """
    command = state_repo.get_command(current_ward)
    return {"command": command, "ward_id": current_ward}
