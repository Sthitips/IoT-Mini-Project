# ESP32 Soil Sensor Firmware

This folder contains the Arduino sketch that reads soil moisture and publishes the data to the MQTT broker.

## Files

```text
esp32/
└── soil_monitor_esp32/
    └── soil_monitor_esp32.ino
```

## Hardware wiring

| Sensor pin | ESP32 pin |
|---|---|
| VCC | 3.3V |
| GND | GND |
| AOUT | GPIO 34 |

> Use GPIO 34 or another ADC1 pin. Avoid ADC2 pins while Wi-Fi is enabled.

## Arduino IDE setup

1. Install the ESP32 board package.
2. Add this URL in Preferences > Additional Board Manager URLs:

```text
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

3. Install these libraries:

- `PubSubClient`
- `ArduinoJson`

4. Open the sketch file.
5. Update Wi‑Fi and MQTT credentials:

```cpp
const char* WIFI_SSID = "Your_WiFi_Name";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* MQTT_BROKER = "192.168.0.103";
const int MQTT_PORT = 1883;
```

> Do not use `localhost` or `127.0.0.1` here. The ESP32 must connect to the computer running Mosquitto on the LAN.

## Flashing

1. Connect the ESP32 by USB.
2. Select the correct board and serial port.
3. Click Upload.
4. Open Serial Monitor at 115200.

## MQTT topic and payload

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

## Calibration notes

The backend converts raw analog values to moisture percentages. You may need to tune sensor thresholds if your soil behaves differently.

Typical raw values vary by sensor and soil type, so test both dry and wet conditions and calibrate the conversion logic in the backend if needed.

## GitHub push notes

Keep the source sketch and documentation in Git. Do not commit personal Wi‑Fi credentials or secret device details.

