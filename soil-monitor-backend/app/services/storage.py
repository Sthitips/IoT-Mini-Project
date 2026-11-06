import os
import json
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any
from dateutil import parser as dt_parser

from app.schemas.sensor import StoredReading, SensorReading, HistoryItem
from app.services.conversion import raw_to_moisture

# Path to readings JSON file
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
STORAGE_FILE = DATA_DIR / "readings.json"

_lock = threading.Lock()
_latest_reading: Optional[Dict[str, Any]] = None
_device_last_seen: Dict[str, datetime] = {}


def _normalize_timestamp(ts: Optional[datetime]) -> datetime:
    if ts is None:
        return datetime.now(timezone.utc)
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    normalized = ts.astimezone(timezone.utc)
    if normalized.year < 2024:
        return datetime.now(timezone.utc)
    return normalized


def _ensure_storage_initialized():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STORAGE_FILE.exists() or STORAGE_FILE.stat().st_size == 0:
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)


def _load_all_readings_unlocked() -> List[Dict[str, Any]]:
    _ensure_storage_initialized()
    try:
        with open(STORAGE_FILE, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return []
            data = json.loads(content)
            modified = False
            for item in data:
                ts_str = item.get("timestamp")
                if ts_str:
                    try:
                        dt = dt_parser.isoparse(ts_str)
                        if dt.year < 2024:
                            item["timestamp"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                            modified = True
                    except Exception:
                        item["timestamp"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
                        modified = True
            if modified:
                temp_file = STORAGE_FILE.with_suffix(".tmp")
                with open(temp_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, default=str)
                temp_file.replace(STORAGE_FILE)
            return data
    except Exception:
        return []


def _save_all_readings_unlocked(readings: List[Dict[str, Any]]):
    _ensure_storage_initialized()
    temp_file = STORAGE_FILE.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(readings, f, indent=2, default=str)
    temp_file.replace(STORAGE_FILE)


def process_and_save_reading(raw_reading: SensorReading) -> StoredReading:
    """
    Ingest a validated SensorReading, calculate moisture, update device status,
    and persist the reading.
    """
    global _latest_reading

    # Coerce absurd or missing timestamps to now so stale values don't pollute the live chart.
    ts = _normalize_timestamp(raw_reading.timestamp)
    
    # Calculate converted moisture percentage
    moisture = raw_to_moisture(raw_reading.raw_value)
    
    # Standardize timestamp to UTC ISO 8601 string
    ts_iso = ts.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")

    stored_dict = {
        "device_id": raw_reading.device_id,
        "raw_value": raw_reading.raw_value,
        "moisture": moisture,
        "timestamp": ts_iso
    }

    with _lock:
        _device_last_seen[raw_reading.device_id] = datetime.now(timezone.utc)
        _latest_reading = stored_dict

        readings = _load_all_readings_unlocked()
        readings.append(stored_dict)
        # Keep storage bounded to latest 5,000 readings for prototype performance
        if len(readings) > 5000:
            readings = readings[-5000:]
        _save_all_readings_unlocked(readings)

    return StoredReading(
        device_id=stored_dict["device_id"],
        raw_value=stored_dict["raw_value"],
        moisture=stored_dict["moisture"],
        timestamp=ts
    )


def get_latest_reading(device_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Return the most recent processed sensor reading.
    """
    global _latest_reading
    with _lock:
        if _latest_reading and (device_id is None or _latest_reading.get("device_id") == device_id):
            return dict(_latest_reading)
        
        readings = _load_all_readings_unlocked()
        if not readings:
            return None
        
        if device_id:
            for item in reversed(readings):
                if item.get("device_id") == device_id:
                    _latest_reading = item
                    return dict(item)
            return None
        
        _latest_reading = readings[-1]
        return dict(readings[-1])


def get_today_history(device_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Return today's readings formatted for chart visualization:
    [{"time": "HH:MM", "moisture": 42}, ...]
    Aggregates by minute to provide smooth, efficient chart rendering.
    """
    with _lock:
        all_readings = _load_all_readings_unlocked()

    if not all_readings:
        return []

    now_utc = datetime.now(timezone.utc)
    today_date = now_utc.date()

    filtered: List[tuple[datetime, int]] = []
    for item in all_readings:
        if device_id and item.get("device_id") != device_id:
            continue
        try:
            ts_str = item.get("timestamp")
            dt = dt_parser.isoparse(ts_str) if isinstance(ts_str, str) else ts_str
            if dt is None:
                continue
            dt = _normalize_timestamp(dt)
            if dt.year < 2024:
                continue
            if dt.date() == today_date:
                filtered.append((dt, int(item.get("moisture", 0))))
        except Exception:
            continue

    if not filtered:
        # Fallback: use the most recent 24 hours of readings if no entries exist today.
        for item in reversed(all_readings):
            if device_id and item.get("device_id") != device_id:
                continue
            try:
                ts_str = item.get("timestamp")
                dt = dt_parser.isoparse(ts_str) if isinstance(ts_str, str) else ts_str
                if dt is None:
                    continue
                dt = _normalize_timestamp(dt)
                if dt.year < 2024:
                    continue
                if (now_utc - dt).total_seconds() <= 24 * 60 * 60:
                    filtered.append((dt, int(item.get("moisture", 0))))
            except Exception:
                continue

    if not filtered:
        return []

    filtered.sort(key=lambda x: x[0])

    history_items = []
    for dt, moisture in filtered:
        history_items.append({
            "time": dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z"),
            "moisture": int(moisture)
        })

    return history_items


def get_device_status(device_id: str = "esp32-001", timeout_seconds: int = 15) -> Dict[str, Any]:
    """
    Check if the device has transmitted data within the timeout period.
    """
    now = datetime.now(timezone.utc)
    with _lock:
        last_seen = _device_last_seen.get(device_id)

    if last_seen is None:
        latest = get_latest_reading(device_id)
        if latest and "timestamp" in latest:
            try:
                dt = dt_parser.isoparse(latest["timestamp"])
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                last_seen = dt
            except Exception:
                pass

    if last_seen is None:
        return {
            "device_id": device_id,
            "is_online": False,
            "last_seen": None
        }

    is_online = (now - last_seen).total_seconds() <= timeout_seconds
    return {
        "device_id": device_id,
        "is_online": is_online,
        "last_seen": last_seen.isoformat().replace("+00:00", "Z")
    }
