# 🌿 AgroPulse — Backend Service

The backend is built with **FastAPI** and **Python 3.10+**. It runs a background **paho-mqtt** subscriber listening to real-time ESP32 telemetry from `broker.emqx.io`, normalizes timestamps, calculates calibrated volumetric moisture percentages, stores history in a JSON persistence layer, and exposes REST endpoints consumed by the React dashboard.

---

## 📁 Directory Structure

```text
soil-monitor-backend/
├── app/
│   ├── main.py                # FastAPI app initialization, CORS, and lifespan management
│   ├── mqtt/
│   │   └── subscriber.py      # Background MQTT client listening to sensor telemetry
│   ├── routes/
│   │   └── sensor.py          # REST API route handlers
│   ├── schemas/
│   │   └── sensor.py          # Pydantic validation models
│   └── services/
│       ├── conversion.py      # Raw ADC voltage to moisture percentage math
│       ├── recommendations.py # Plant watering dosage and priority advisory
│       └── storage.py         # Thread-safe reading storage and daily history retrieval
├── data/
│   └── readings.json          # Persistent JSON telemetry store
├── .env.example               # Configuration template
├── requirements.txt           # Pinned production dependencies
└── test_backend.py            # Unit test suite for calibration and storage logic
```

---

## ⚙️ Environment Variables

Copy the example file to create your local `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|:---|:---|:---|
| `MQTT_BROKER` | `broker.emqx.io` | Cloud or local MQTT broker hostname |
| `MQTT_PORT` | `1883` | MQTT port (1883 standard, 8883 for TLS) |
| `MQTT_TOPIC` | `soil-monitor/+/readings` | Topic pattern with wildcard for device ID |
| `MQTT_USE_TLS` | `false` | Enable TLS certificate verification if using TLS port |
| `CORS_ORIGINS` | `*` | Allowed CORS origins for frontend access |
| `DRY_RAW` | `3000` | Sensor raw ADC value when completely dry (in air) |
| `WET_RAW` | `1200` | Sensor raw ADC value when fully saturated (in water) |

---

## 🚀 Local Setup & Execution

### 1. Create Virtual Environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the Development Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API Base URL: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`
- Service Health Check: `http://localhost:8000/health`

---

## 📡 REST API Endpoints

### 1. Health Check
`GET /health`
```json
{
  "status": "ok",
  "service": "agropulse-backend"
}
```

### 2. Latest Sensor Reading
`GET /api/sensor/latest?device_id=esp32-001`
```json
{
  "device_id": "esp32-001",
  "raw_value": 1650,
  "moisture": 75,
  "timestamp": "2026-11-07T11:06:18.885540Z"
}
```

### 3. Chronological History (Chart View)
`GET /api/sensor/history?device_id=esp32-001`
```json
[
  {
    "time": "2026-11-07T11:00:00Z",
    "moisture": 72
  },
  {
    "time": "2026-11-07T11:05:00Z",
    "moisture": 75
  }
]
```

### 4. Device Connectivity Status
`GET /api/sensor/status?device_id=esp32-001`
```json
{
  "device_id": "esp32-001",
  "is_online": true,
  "last_seen": "2026-11-07T11:06:18.885540Z"
}
```

### 5. Smart Irrigation Recommendations
`GET /api/recommendations?device_id=esp32-001`
```json
{
  "status": "Optimal Range",
  "moisture": 75,
  "action": "Maintain routine monitoring. Soil moisture is currently balanced.",
  "priority": "low",
  "dosage_ml": 0
}
```

---

## 🧪 Testing

Execute the test suite to verify conversion and aggregation algorithms:

```bash
python3 test_backend.py
```

Expected output:
```text
Testing conversion logic...
✓ Conversion logic tests passed.
Testing storage logic...
✓ Storage and aggregation tests passed.

🎉 ALL BACKEND UNIT TESTS PASSED!
```