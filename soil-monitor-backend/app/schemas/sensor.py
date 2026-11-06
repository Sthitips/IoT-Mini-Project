from datetime import datetime, timezone
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator


class SensorReading(BaseModel):
    device_id: str
    raw_value: int
    timestamp: Optional[datetime] = None

    @field_validator("timestamp", mode="before")
    @classmethod
    def sanitize_timestamp(cls, v: Any) -> datetime:
        if not v or v == "" or (isinstance(v, str) and not v.strip()):
            return datetime.now(timezone.utc)
        if isinstance(v, datetime):
            return v
        try:
            from dateutil import parser as dt_parser
            dt = dt_parser.isoparse(v)
            if dt.year < 2024:
                return datetime.now(timezone.utc)
            return dt
        except Exception:
            return datetime.now(timezone.utc)


class StoredReading(BaseModel):
    device_id: str
    raw_value: int
    moisture: int = Field(ge=1, le=100)
    timestamp: datetime


class HistoryItem(BaseModel):
    time: str
    moisture: int


class SensorHistory(BaseModel):
    readings: List[HistoryItem]


class DeviceStatus(BaseModel):
    device_id: str
    is_online: bool
    last_seen: Optional[datetime] = None


class RecommendationResponse(BaseModel):
    moisture: int
    status: str
    recommendation: str