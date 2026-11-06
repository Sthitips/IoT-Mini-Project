# Smart Soil Monitoring System

A full-stack IoT project that monitors soil moisture with an ESP32, forwards readings through a Mosquitto MQTT broker, stores them in a FastAPI backend, and displays the live system status in a React dashboard.

## Overview

This project was designed to help you:

- collect soil moisture readings from a physical sensor
- send those readings wirelessly over MQTT
- validate and convert the raw values in Python
- store measurement history locally
- show live moisture, health, and recommendations in a browser

## Architecture

```text
Soil sensor -> ESP32 -> MQTT broker -> FastAPI backend -> JSON storage + REST API -> React dashboard
```

## Components

- `esp32/` — Arduino sketch and hardware setup for the ESP32 sensor node
- `mosquitto/` — broker configuration and instructions
- `soil-monitor-backend/` — Python FastAPI service and local data storage
- `soil-monitor-frontend/` — React + Vite dashboard for the UI
- `run_all.sh` — starts Mosquitto, backend, and frontend together
- `stop_all.sh` — stops all services

## Features

- real-time MQTT data ingestion
- moisture conversion from raw analog values
- device health and connectivity checks
- historical moisture charting
- watering recommendations based on moisture thresholds
- mobile-friendly dashboard
- local JSON-based persistence for simple deployment

## Tech stack

- ESP32 + Arduino
- Mosquitto MQTT broker
- Python 3
- FastAPI
- Pydantic
- React
- Vite
- Recharts
- Tailwind CSS

## Quick start

1. Start the broker and backend/frontend stack:

```bash
cd /home/ansuman30/Music/IOT_SOIL
./run_all.sh
```

2. Open the frontend on your browser or phone using the displayed LAN URL.

3. If using actual hardware, flash the ESP32 sketch from `esp32/soil_monitor_esp32/soil_monitor_esp32.ino`.

## Project structure

```text
IOT_SOIL/
├── README.md
├── run_all.sh
├── stop_all.sh
├── simulate_esp32.py
├── esp32/
│   ├── README.md
│   └── soil_monitor_esp32/
│       └── soil_monitor_esp32.ino
├── mosquitto/
│   ├── README.md
│   └── mosquitto.conf
├── soil-monitor-backend/
│   ├── README.md
│   ├── app/
│   ├── data/
│   ├── requirements.txt
│   ├── .env.example
│   ├── test_backend.py
│   └── test_routes.py
├── soil-monitor-frontend/
│   ├── README.md
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   └── public/
└── .gitignore
```

## GitHub push guidance

When pushing to GitHub, keep these in the repository:

- source code
- config files
- README files
- scripts such as `run_all.sh` and `stop_all.sh`
- `.env.example` files
- sample or seed data if you want a project demo

Do not commit:

- `.venv/`
- `node_modules/`
- `dist/`
- local `.env` files
- logs and temporary files
- generated runtime artifacts

## Documentation by folder

- [esp32/README.md](esp32/README.md)
- [mosquitto/README.md](mosquitto/README.md)
- [soil-monitor-backend/README.md](soil-monitor-backend/README.md)
- [soil-monitor-frontend/README.md](soil-monitor-frontend/README.md)

## License

This project is provided for learning and prototype deployment. Adjust licensing as needed before public release.


```bash
cd backend
```

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

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the React development server:

```bash
npm run dev
```

The frontend will generally be available at:

```text
http://localhost:5173
```

### 4. Configure MQTT and ESP32

Configure the Mosquitto broker and connect the ESP32 to it.

Ensure that the ESP32 publishes messages using the agreed topic and JSON payload structure.

Refer to the backend README for detailed MQTT integration requirements.

## 🔌 API Endpoints

The FastAPI backend exposes the following endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/sensor/latest` | GET | Retrieves the latest sensor reading |
| `/api/sensor/history` | GET | Retrieves today's moisture history |
| `/api/sensor/status` | GET | Retrieves device connectivity status |
| `/api/sensor/readings` | POST | Test endpoint for inserting sensor readings |

Interactive API documentation is available at:

`http://127.0.0.1:8000/docs`

## 📡 Sensor Data Frequency

The ESP32 is configured to publish sensor readings approximately once every second.

The backend processes incoming readings and maintains the latest actual measurement.

For historical visualization, readings can be aggregated into one-minute averages to reduce the number of chart points and storage overhead.

The dashboard periodically fetches updated information from the backend.

## ⚠️ Important Notes

- The ESP32 sends raw sensor values; moisture conversion is performed by the backend.
- The raw-to-moisture conversion depends on actual dry and wet soil calibration values.
- The React frontend communicates with FastAPI rather than directly connecting to the MQTT broker.
- The project uses local JSON storage and does not require an external database.
- MQTT credentials and sensitive configuration must not be committed to GitHub.
- Local JSON storage is intended for prototype-scale usage and requires appropriate write synchronization.

## 📄 License

This project is developed for academic and educational purposes.
