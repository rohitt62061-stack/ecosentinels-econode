from pydantic import BaseModel
from typing import Optional, Dict, Any

class WardBase(BaseModel):
    id: str
    name: str

class WardCreate(WardBase):
    pass

class WardState(BaseModel):
    command: str = "IDLE"
    latest_aqi: Optional[int] = None
    sensor_data: Dict[str, Any] = {}
