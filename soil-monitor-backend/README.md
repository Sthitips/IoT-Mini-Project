# Soil Monitor Backend

This folder contains the Python API and MQTT logic for the soil monitoring system.

## What it does

- subscribes to MQTT readings from the ESP32
- validates incoming JSON payloads
- converts analog sensor values into moisture percentages
- stores the data in `data/readings.json`
- exposes REST endpoints to the frontend
- provides recommendation logic for watering actions

## Project structure

```text
soil-monitor-backend/
├── app/
│   ├── mqtt/
│   │   └── subscriber.py
│   ├── routes/
│   │   └── sensor.py
│   ├── schemas/
│   │   └── sensor.py
│   ├── services/
│   │   ├── conversion.py
│   │   └── storage.py
│   └── main.py
├── data/
│   └── readings.json
├── .env.example
├── .gitignore
├── requirements.txt
├── test_backend.py
├── test_routes.py
└── README.md
```

## Requirements

- Python 3.10+
- pip
- access to a running Mosquitto broker

## Setup

```bash
cd soil-monitor-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run the API

```bash
cd soil-monitor-backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:

- http://localhost:8000
- http://<your-lan-ip>:8000

## API endpoints

```text
GET /                     -> API info and available routes
GET /api/sensor/latest    -> latest reading for a device
GET /api/sensor/history   -> historical readings for charting
GET /api/sensor/status   -> device online/offline status
POST /api/sensor/readings -> manually add a reading
GET /api/recommendations -> watering recommendation
```

## MQTT message format

Topic:

```text
soil-monitor/esp32-001/readings
```

Payload:

```json
{
  "device_id": "esp32-001",
  "raw_value": 2100,
  "timestamp": "2026-11-07T10:00:00Z"
}
```

The backend calculates the moisture percentage and stores the result in JSON.

## Local data storage

The data file is kept at:

```text
soil-monitor-backend/data/readings.json
```

This file is used as a simple local persistence layer. For production, you would normally replace it with a database.

## Testing

```bash
cd soil-monitor-backend
source .venv/bin/activate
python test_backend.py
```

## GitHub push notes

Keep this folder tracked, but exclude:

- `.venv/`
- `__pycache__/`
- local secret environment files
- generated logs

Use `.env.example` to document environment variables without exposing real secrets.

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