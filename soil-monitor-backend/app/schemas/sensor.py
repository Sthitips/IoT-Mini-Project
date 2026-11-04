from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SensorReading(BaseModel):
    device_id: str
    raw_value: Optional[int] = None
    timestamp: datetime

class StoredReading(BaseModel):
    device_id: str
    raw_value: int
    moisture: int = Field(ge=1, le=100)
    timestamp: datetime


class SensorHistory(BaseModel):
    readings: list[StoredReading]