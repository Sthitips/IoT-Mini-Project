# 📡 ESP32 Soil Sensor Firmware
 
This directory contains the Arduino firmware for the ESP32 soil moisture sensor node. It samples analog soil moisture voltage, synchronizes UTC time via NTP, and broadcasts JSON telemetry over MQTT to `broker.emqx.io`.
 
---
 
## 📁 Files
 
```text
esp32/
└── soil_monitor_esp32/
    └── soil_monitor_esp32.ino   # Main Arduino sketch
```
 
---
 
## 🔌 Hardware Wiring
 
| Sensor Pin | ESP32 Dev Module Pin | Description |
|:---|:---|:---|
| **VCC** | **3.3V** (or VIN) | Power supply (3.3V recommended to protect ADC input) |
| **GND** | **GND** | Common ground |
| **AOUT (Analog Out)** | **GPIO 34** | Analog output connected to ADC1 channel 6 |
 
> ⚠️ **Important:** Always use ADC1 pins (**GPIO 32, 33, 34, 35, 36, 39**). Do not use ADC2 pins because the ESP32 disables ADC2 when Wi-Fi is active.
 
---
 
## 🛠️ Arduino IDE Setup
 
### 1. Board Package
1. In Arduino IDE, open **File** → **Preferences**.
2. Add the ESP32 boards manager URL:
   ```text
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Open **Tools** → **Board** → **Boards Manager...**
4. Search for **`esp32` by Espressif Systems**.
5. Install **version 3.0.7** (recommended for Snap and Linux environments).
 
### 2. Required Libraries
Install these via **Sketch** → **Include Library** → **Manage Libraries...**:
- **`PubSubClient`** by Nick O'Leary
- **`ArduinoJson`** by Benoît Blanchon (version 6.x or 7.x)
 
---
 
## ⚙️ Configuration
 
In [`soil_monitor_esp32.ino`](file:///home/ansuman30/Music/IOT_SOIL/esp32/soil_monitor_esp32/soil_monitor_esp32.ino), update your Wi-Fi credentials:
 
```cpp
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
```
 
The MQTT broker is pre-configured to use the public broker:
```cpp
const char* MQTT_BROKER = "broker.emqx.io";
const int   MQTT_PORT   = 1883;
const char* DEVICE_ID   = "esp32-001";
const char* MQTT_TOPIC  = "soil-monitor/esp32-001/readings";
```
 
---
 
## 📤 Flashing the Firmware
 
1. Connect the ESP32 to your computer via USB.
2. In Arduino IDE, select:
   - **Board:** `ESP32 Dev Module`
   - **Port:** `/dev/ttyUSB0` (Linux) or `COMx` (Windows)
   - **Upload Speed:** `921600` (or `115200`)
3. Click **Upload (▶)**.
4. Open the **Serial Monitor** at **115200 baud**.
 
Expected output:
```text
--- AgroPulse ESP32 Starting ---
Connecting to Wi-Fi: Your_SSID
[WiFi] Connected. IP: 192.168.0.x
[NTP] Time synchronized.
[MQTT] Connecting to broker.emqx.io:1883...
[MQTT] Connected to broker.
[MQTT] Publish: {"device_id":"esp32-001","raw_value":2045,"timestamp":"2026-11-07T11:45:00Z"}
```
 
---
 
## 📡 Telemetry Payload Specification
 
- **Topic:** `soil-monitor/esp32-001/readings`
- **Format:** JSON
```json
{
  "device_id": "esp32-001",
  "raw_value": 2045,
  "timestamp": "2026-11-07T11:45:00Z"
}
```
- Raw values represent 12-bit ADC readings (`0` to `4095`).
- The backend handles conversion from raw ADC values to percentage based on soil calibration.

