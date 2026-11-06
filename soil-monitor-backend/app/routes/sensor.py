from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.sensor import (
    SensorReading,
    StoredReading,
    SensorHistory,
    DeviceStatus,
    RecommendationResponse
)
from app.services import storage, conversion

router = APIRouter(tags=["Sensor"])


@router.get("/sensor/latest", response_model=StoredReading)
def get_latest_reading(device_id: Optional[str] = Query(None, description="Optional Device ID filter")):
    """
    Retrieve the most recent soil moisture sensor reading.
    """
    reading = storage.get_latest_reading(device_id)
    if not reading:
        raise HTTPException(
            status_code=404,
            detail="No sensor readings available yet. Publish MQTT readings or use POST /api/sensor/readings."
        )
    return reading


@router.get("/sensor/history", response_model=SensorHistory)
def get_sensor_history(device_id: Optional[str] = Query(None, description="Optional Device ID filter")):
    """
    Retrieve today's historical moisture readings formatted for chart visualization.
    """
    readings = storage.get_today_history(device_id)
    return {"readings": readings}


@router.get("/sensor/status", response_model=DeviceStatus)
def get_sensor_status(
    device_id: str = Query("esp32-001", description="Device ID to check"),
    timeout: int = Query(15, description="Timeout in seconds to consider device offline")
):
    """
    Retrieve device connectivity status (online if data arrived within timeout).
    """
    return storage.get_device_status(device_id=device_id, timeout_seconds=timeout)


@router.post("/sensor/readings", response_model=StoredReading, status_code=201)
def create_sensor_reading(reading: SensorReading):
    """
    Test endpoint for manually submitting raw sensor readings.
    Processes the raw value, calculates moisture percentage, and stores the reading.
    """
    stored = storage.process_and_save_reading(reading)
    return stored


@router.get("/recommendations", response_model=RecommendationResponse)
def get_watering_recommendation(device_id: Optional[str] = Query(None)):
    """
    Retrieve smart watering recommendation based on the current moisture level.
    """
    latest = storage.get_latest_reading(device_id)
    current_moisture = latest.get("moisture", 50) if latest else 50
    return conversion.get_recommendation(current_moisture)