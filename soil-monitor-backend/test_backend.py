import os
import sys
from datetime import datetime, timezone

# Ensure app package is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.schemas.sensor import SensorReading
from app.services.conversion import raw_to_moisture, get_recommendation
from app.services.storage import (
    process_and_save_reading,
    get_latest_reading,
    get_today_history,
    get_device_status
)

def test_conversion():
    print("Testing conversion logic...")
    # DRY_RAW = 3000, WET_RAW = 1200
    # Dry test (>= 3000)
    dry_val = raw_to_moisture(3000, dry_raw=3000, wet_raw=1200)
    assert dry_val == 1, f"Expected 1%, got {dry_val}%"
    
    # Overly dry test (> 3000)
    super_dry = raw_to_moisture(3500, dry_raw=3000, wet_raw=1200)
    assert super_dry == 1, f"Expected clamped 1%, got {super_dry}%"

    # Wet test (<= 1200)
    wet_val = raw_to_moisture(1200, dry_raw=3000, wet_raw=1200)
    assert wet_val == 100, f"Expected 100%, got {wet_val}%"

    # Midpoint test (~2100)
    mid_val = raw_to_moisture(2100, dry_raw=3000, wet_raw=1200)
    assert 48 <= mid_val <= 52, f"Expected ~50%, got {mid_val}%"
    
    # Recommendations
    rec_dry = get_recommendation(15)
    assert rec_dry["status"] == "Dry"
    rec_med = get_recommendation(45)
    assert rec_med["status"] == "Moderate"
    rec_wet = get_recommendation(75)
    assert rec_wet["status"] == "Healthy"
    print("✓ Conversion logic tests passed.")

def test_storage():
    print("Testing storage logic...")
    reading = SensorReading(
        device_id="esp32-001",
        raw_value=2100,
        timestamp=datetime.now(timezone.utc)
    )
    stored = process_and_save_reading(reading)
    assert stored.device_id == "esp32-001"
    assert stored.moisture >= 1 and stored.moisture <= 100
    
    latest = get_latest_reading("esp32-001")
    assert latest is not None
    assert latest["device_id"] == "esp32-001"
    assert latest["raw_value"] == 2100

    history = get_today_history("esp32-001")
    assert isinstance(history, list)
    assert len(history) > 0
    assert "time" in history[0]
    assert "moisture" in history[0]

    status = get_device_status("esp32-001", timeout_seconds=5)
    assert status["is_online"] is True
    print("✓ Storage and aggregation tests passed.")


def test_history_keeps_same_minute_readings_distinct():
    base = datetime.now(timezone.utc).replace(second=0, microsecond=0)

    first = SensorReading(device_id="chart-debug", raw_value=2000, timestamp=base)
    second = SensorReading(device_id="chart-debug", raw_value=5000, timestamp=base.replace(second=20))

    process_and_save_reading(first)
    process_and_save_reading(second)

    history = get_today_history("chart-debug")
    assert len(history) >= 2
    assert len({item["moisture"] for item in history}) > 1


def test_ignores_absurd_old_timestamps():
    stale = SensorReading(device_id="chart-debug", raw_value=3000, timestamp=datetime(1970, 1, 1, tzinfo=timezone.utc))
    stored = process_and_save_reading(stale)

    assert stored.timestamp.year >= 2020
    assert stored.timestamp != datetime(1970, 1, 1, tzinfo=timezone.utc)


def test_handles_empty_or_none_timestamps():
    # Test with empty string timestamp as sent by ESP32 without NTP
    r1 = SensorReading(device_id="esp32-001", raw_value=2400, timestamp="")
    assert r1.timestamp is not None
    assert r1.timestamp.year >= 2024
    s1 = process_and_save_reading(r1)
    assert s1.timestamp.year >= 2024

    # Test with None timestamp
    r2 = SensorReading(device_id="esp32-001", raw_value=2400, timestamp=None)
    assert r2.timestamp is not None
    s2 = process_and_save_reading(r2)
    assert s2.timestamp.year >= 2024


if __name__ == "__main__":
    test_conversion()
    test_storage()
    test_history_keeps_same_minute_readings_distinct()
    test_ignores_absurd_old_timestamps()
    test_handles_empty_or_none_timestamps()
    print("\n🎉 ALL BACKEND UNIT TESTS PASSED!")
