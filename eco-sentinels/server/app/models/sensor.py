from pydantic import BaseModel
from typing import Optional

class SensorDataBase(BaseModel):
    pm25: float
    pm10: float
    temp: float
    humidity: float

class SensorDataCreate(SensorDataBase):
    ward_id: str # Required for multi-tenancy auth isolation

class SensorData(SensorDataBase):
    ward_id: str
    aqi: int
    calibrated_pm25: Optional[float] = None
