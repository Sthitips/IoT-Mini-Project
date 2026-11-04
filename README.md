# 🌱 Smart Soil Monitoring & Recommendation System

An IoT-based soil moisture monitoring system that collects real-time sensor readings, tracks soil conditions and provides intelligent watering recommendations through a web dashboard.

## 📌 Overview

The Smart Soil Monitoring and Recommendation System aims to help users monitor soil moisture levels and make informed watering decisions.

The system uses an ESP32 connected to a soil moisture sensor to collect raw sensor readings. These readings are transmitted using MQTT through a Mosquitto broker to a FastAPI backend.

The backend processes the incoming readings, converts raw analog values into moisture percentages, stores historical data locally and generates watering recommendations.

A React-based dashboard displays the latest moisture levels, historical trends, device connectivity and recommendations.

## ✨ Key Features

- **Real-Time Monitoring:** Continuously collects soil moisture readings through an ESP32.
- **MQTT Communication:** Uses Mosquitto for lightweight communication between the IoT device and backend.
- **Moisture Conversion:** Converts raw analog sensor readings into a percentage between 1 and 100.
- **Historical Tracking:** Stores sensor readings with timestamps for daily moisture analysis.
- **Interactive Dashboard:** Visualizes current moisture levels and historical trends.
- **Smart Recommendations:** Provides watering suggestions based on soil moisture levels.
- **Device Monitoring:** Tracks ESP32 connectivity and the last received sensor reading.
- **Lightweight Storage:** Uses local JSON-based storage without requiring an external database.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| HTTP Requests | Axios |
| Backend | Python, FastAPI |
| Data Validation | Pydantic |
| Communication Protocol | MQTT |
| MQTT Broker | Eclipse Mosquitto |
| Microcontroller | ESP32 |
| Sensor | Soil Moisture Sensor |
| Data Storage | JSON |

## 🏗️ System Architecture

```text
       SOIL MOISTURE SENSOR
                |
                v
              ESP32
                |
          MQTT Publish
                |
                v
        MOSQUITTO BROKER
                |
         MQTT Subscribe
                |
                v
          FASTAPI BACKEND
                |
        Data Validation
                |
        Moisture Conversion
                |
        Recommendation Logic
                |
                v
           JSON STORAGE
                |
             REST APIs
                |
                v
          REACT DASHBOARD
                |
       +--------+---------+
       |        |         |
    Moisture  History  Recommendations
     Level     Chart
```

## 🔄 How It Works

### 1. Sensor Data Collection

The soil moisture sensor measures the moisture content of the soil and provides an analog reading to the ESP32.

The ESP32 collects:
- Device ID
- Raw analog sensor value
- Timestamp

### 2. MQTT Communication

The ESP32 publishes sensor readings to the Mosquitto MQTT broker at regular intervals.

**MQTT Topic:**

```text
soil-monitor/esp32-001/readings
```

**Example payload:**

```json
{
  "device_id": "esp32-001",
  "raw_value": 2100,
  "timestamp": "2026-11-04T10:30:00Z"
}
```

### 3. Backend Processing

The FastAPI backend subscribes to the MQTT topic and processes incoming messages.

The backend:
- Validates incoming sensor data.
- Converts raw analog readings into a moisture percentage between 1 and 100.
- Stores both raw and converted values with timestamps.
- Generates watering recommendations based on the converted moisture percentage.

### 4. Data Storage

Processed readings are stored locally in a JSON file.

```text
backend/data/readings.json
```

Each stored record contains:

```json
{
  "device_id": "esp32-001",
  "raw_value": 2100,
  "moisture": 65,
  "timestamp": "2026-11-04T10:30:00Z"
}
```

### 5. Dashboard Visualization

The React frontend fetches processed data through FastAPI REST endpoints.

The dashboard displays:
- Current soil moisture percentage.
- Plant moisture status.
- Historical moisture chart.
- Device connectivity status.
- Watering recommendations.

## 📊 Recommendation Logic

The system initially uses threshold-based recommendations.

| Moisture Level | Status | Recommendation |
|---|---|---|
| 1–29% | Dry | Water the plant |
| 30–59% | Moderate | Monitor soil moisture |
| 60–100% | Healthy | Avoid watering for now |

These thresholds are initial demonstration values. They can be adjusted based on plant type, soil characteristics and sensor calibration.

## 📁 Project Structure

```text
IoT mini project/
│
├── soil-monitor-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── hooks/
│   │   └── data/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── soil-monitor-backend/
│   ├── app/
│   │   ├── mqtt/
│   │   │   └── subscriber.py
│   │   ├── routes/
│   │   │   └── sensor.py
│   │   ├── schemas/
│   │   │   └── sensor.py
│   │   ├── services/
│   │   │   ├── storage.py
│   │   │   └── conversion.py
│   │   └── main.py
│   │
│   ├── data/
│   │   └── readings.json
│   ├── requirements.txt
│   └── README.md
│
└── README.md
```

*The folder names should be adjusted to match the actual repository layout.*

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js and npm
- Python 3.10 or later
- Mosquitto MQTT broker
- Arduino IDE or PlatformIO for ESP32 development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd soil-monitor
```

### 2. Run the Backend

Navigate to the backend directory:

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