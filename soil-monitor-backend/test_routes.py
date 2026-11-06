import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_api():
    client = TestClient(app)
    
    # Root check
    r = client.get("/")
    assert r.status_code == 200
    print("✓ GET / returned 200")

    # POST test reading
    payload = {
        "device_id": "esp32-001",
        "raw_value": 1800,
        "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    }
    r = client.post("/api/sensor/readings", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["device_id"] == "esp32-001"
    assert data["moisture"] > 0
    print(f"✓ POST /api/sensor/readings returned: {data}")

    # GET latest
    r = client.get("/api/sensor/latest")
    assert r.status_code == 200
    latest = r.json()
    assert latest["device_id"] == "esp32-001"
    assert latest["raw_value"] == 1800
    print(f"✓ GET /api/sensor/latest returned: {latest}")

    # GET history
    r = client.get("/api/sensor/history")
    assert r.status_code == 200
    hist = r.json()
    assert "readings" in hist
    assert len(hist["readings"]) > 0
    print(f"✓ GET /api/sensor/history returned: {hist}")

    # GET status
    r = client.get("/api/sensor/status?device_id=esp32-001")
    assert r.status_code == 200
    stat = r.json()
    assert stat["is_online"] is True
    print(f"✓ GET /api/sensor/status returned: {stat}")

    # GET recommendations
    r = client.get("/api/recommendations")
    assert r.status_code == 200
    rec = r.json()
    assert "status" in rec
    assert "recommendation" in rec
    print(f"✓ GET /api/recommendations returned: {rec}")

if __name__ == "__main__":
    test_api()
    print("\n🎉 ALL FASTAPI ROUTE TESTS PASSED!")
