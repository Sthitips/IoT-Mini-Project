# Soil Monitor – Backend

## Overview

This repository contains the backend for the Smart Soil Moisture Monitoring and Recommendation System.

The backend is built using **FastAPI** and uses a local JSON file for storing sensor readings. It receives soil moisture data from an ESP32 through the Mosquitto MQTT broker, converts raw sensor readings into moisture percentages, stores the processed data and exposes REST APIs for the React frontend.

**No external database is required.**

## Technology Stack

- Python
- FastAPI
- Pydantic
- Mosquitto MQTT
- JSON file storage
- Uvicorn

## Project Structure

```text
soil-monitor-backend/
│
├── .venv/
│
├── app/
│   ├── mqtt/
│   │   ├── __init__.py
│   │   └── subscriber.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   └── sensor.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── sensor.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── conversion.py
│   │   └── storage.py
│   │
│   └── main.py
│
├── data/
│   └── readings.json
│
├── .gitignore
├── requirements.txt
└── README.md
```

## 1. System Architecture

```text
Soil Moisture Sensor
        |
        v
      ESP32
        |
        | MQTT Publish
        v
 Mosquitto MQTT Broker
        |
        | MQTT Subscribe
        v
 FastAPI MQTT Subscriber
        |
        v
 Raw Data Validation
        |
        v
 Moisture Conversion
        |
        v
   JSON Storage
        |
        v
    REST APIs
        |
        v
 React Dashboard
```

## 2. Incoming MQTT Data Format

The ESP32 must publish the following JSON payload to the MQTT broker.

**Topic:**

```text
soil-monitor/esp32-001/readings
```

**Payload:**

```json
{
  "device_id": "esp32-001",
  "raw_value": 2100,
  "timestamp": "2026-11-04T10:30:00Z"
}
```

### Payload requirements

| Field | Data type | Description |
|---|---|---|
| device_id | String | Unique identifier of the ESP32 |
| raw_value | Integer | Raw analog reading from the soil moisture sensor |
| timestamp | ISO 8601 string | Time at which the reading was recorded |

Important:
- Do not send the converted moisture percentage from the ESP32.
- The backend is responsible for converting raw readings.
- Timestamps should use ISO 8601 format in UTC, preferably ending with `Z`.
- The topic and payload structure must remain consistent.

## 3. File-wise Implementation Guide

### A. `app/mqtt/subscriber.py`

**Responsibility: MQTT communication**

This file handles communication between Mosquitto and FastAPI.

The MQTT implementation should:

1. Connect to the Mosquitto broker.
2. Subscribe to `soil-monitor/esp32-001/readings`.
3. Receive incoming MQTT messages.
4. Decode the message payload from bytes into JSON.
5. Pass the decoded payload to the backend ingestion function.
6. Handle connection failures and reconnect when necessary.

The subscriber should NOT implement its own storage or moisture conversion logic.

It should reuse the existing services.

Expected integration:

```python
def on_message(client, userdata, message):
    payload = json.loads(message.payload.decode())

    process_reading(payload)
```

The `process_reading()` function should be imported from the appropriate backend service.

The MQTT connection should be started as part of the FastAPI application lifecycle without blocking the API server.

### B. `app/schemas/sensor.py`

**Responsibility: Data validation**

This file defines the expected structure of incoming and processed sensor readings.

Incoming data:

```python
class SensorReading(BaseModel):
    device_id: str
    raw_value: int
    timestamp: datetime
```

Processed data:

```python
class StoredReading(BaseModel):
    device_id: str
    raw_value: int
    moisture: int
    timestamp: datetime
```

Moisture must be constrained to the range 1–100.

Pydantic validation should reject malformed payloads and invalid readings.

### C. `app/services/conversion.py`

**Responsibility: Raw sensor value conversion**

The raw analog value must be converted into a moisture percentage between 1 and 100.

Use the following calibration parameters:

```python
DRY_RAW = 3000
WET_RAW = 1200
```

These are example values and MUST be replaced with actual readings obtained during sensor calibration.

Conversion formula:

```python
moisture = 1 + (
    (raw_value - DRY_RAW)
    * 99
    / (WET_RAW - DRY_RAW)
)
```

Clamp the result between 1 and 100 and round it to an integer.

The formula assumes that the raw sensor value decreases as moisture increases. Verify this using actual dry and wet soil measurements.

**Important:** The conversion must happen in the backend, not in the ESP32 firmware or React frontend.

### D. `app/services/storage.py`

**Responsibility: JSON data storage**

This file manages all reading-related storage operations.

It should provide reusable functions for:

- Saving a processed sensor reading.
- Retrieving the latest reading.
- Retrieving all readings for a device.
- Retrieving readings for the current day.

The storage format should be:

```json
{
  "device_id": "esp32-001",
  "raw_value": 2100,
  "moisture": 65,
  "timestamp": "2026-11-04T10:30:00Z"
}
```

Both the raw value and converted moisture percentage must be stored.

All readings should be appended to `data/readings.json`.

Use appropriate file locking and avoid rewriting the entire history for every incoming message. The system must handle the expected one-message-per-second publishing frequency.

### F. `app/routes/sensor.py`

**Responsibility: Sensor REST APIs**

This file exposes the sensor-related API endpoints.

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/sensor/latest` | GET | Retrieve the latest reading |
| `/api/sensor/history` | GET | Retrieve today's moisture history |
| `/api/sensor/status` | GET | Retrieve ESP32 connectivity status |
| `/api/sensor/readings` | POST | Insert a test reading |

The POST endpoint is intended for testing without requiring an ESP32 connection.

The history endpoint should return readings in chronological order.

For chart efficiency, historical data may be aggregated into one-minute averages, while the latest-reading endpoint should always return the most recent actual reading.

### G. `app/main.py`

**Responsibility: Application entry point**

This file should:

1. Initialize the FastAPI application.
2. Configure CORS for the React frontend.
3. Register all API routers.
4. Start and stop the MQTT subscriber using the application lifecycle.

The MQTT subscriber must not block the FastAPI event loop.

## 4. Frontend API Contract

The React frontend expects the following endpoints and response formats.

### Latest sensor reading

`GET /api/sensor/latest`

```json
{
  "device_id": "esp32-001",
  "raw_value": 2100,
  "moisture": 65,
  "timestamp": "2026-11-04T10:30:00Z"
}
```

### Historical readings

`GET /api/sensor/history`

```json
{
  "readings": [
    {
      "time": "10:00",
      "moisture": 42
    },
    {
      "time": "10:05",
      "moisture": 55
    },
    {
      "time": "10:10",
      "moisture": 65
    }
  ]
}
```

### Device status

`GET /api/sensor/status`

```json
{
  "device_id": "esp32-001",
  "is_online": true,
  "last_seen": "2026-11-04T10:30:00Z"
}
```

The device should be considered offline if no recent readings have arrived within the configured timeout.

**API response formats must remain consistent**, as the React frontend consumes these structures directly.

## 5. Setup Instructions

### Prerequisites

- Python 3.10 or later
- Mosquitto MQTT broker
- Node.js for the frontend

### Backend installation

Clone the repository and navigate to the backend folder.

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### Run FastAPI

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

## 6. Testing

Before connecting the ESP32, test the backend using Swagger UI or Postman.

Send a POST request to:

```text
POST /api/sensor/readings
```

Example request:

```json
{
  "device_id": "esp32-001",
  "raw_value": 2100,
  "timestamp": "2026-11-04T10:30:00Z"
}
```

Verify that:

1. The backend accepts the payload.
2. The raw value is converted into a moisture percentage.
3. Both raw and converted values are saved.
4. The latest-reading API returns the processed reading.
5. The history endpoint returns today's readings.
6. The recommendation endpoint returns the expected message.

After these checks, test the same flow through MQTT.

## 7. Important Integration Rules

- ESP32 publishes only `device_id`, `raw_value` and `timestamp`.
- Mosquitto is responsible for MQTT message delivery.
- FastAPI handles validation and raw-to-moisture conversion.
- JSON storage maintains the reading history.
- React must receive converted moisture values, never raw values for display.
- MQTT subscriber and POST testing endpoint must use the same reading-processing and storage functions.
- The latest sensor reading should be kept separately from aggregated chart history.
- Do not create a separate database.
- Keep broker credentials outside the source code.

---

**Integration objective:** The ESP32 should publish a raw sensor reading to Mosquitto, the FastAPI subscriber should process and store it, and the React dashboard should automatically display the updated moisture percentage and historical trend.