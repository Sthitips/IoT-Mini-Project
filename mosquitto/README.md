# Mosquitto Broker Setup

This folder contains the Mosquitto configuration for the IoT project.

## Purpose

Mosquitto acts as the MQTT broker between the ESP32 sensor node and the Python backend.

## Files

```text
mosquitto/
├── mosquitto.conf
└── README.md
```

## Install Mosquitto

### Linux

```bash
sudo apt update
sudo apt install -y mosquitto mosquitto-clients
```

### macOS

```bash
brew install mosquitto
```

### Windows

Download the official installer from the Mosquitto website and install it.

## Start the broker

From the project root:

```bash
mosquitto -c mosquitto/mosquitto.conf -v
```

The config enables:

- listener on port 1883
- access from the local Wi‑Fi network
- anonymous local testing for development

## Test the broker

Subscribe:

```bash
mosquitto_sub -h localhost -t "soil-monitor/+/readings" -v
```

Publish:

```bash
mosquitto_pub -h localhost -p 1883 -t "soil-monitor/esp32-001/readings" -m '{"device_id":"esp32-001","raw_value":2100,"timestamp":"2026-11-07T10:00:00Z"}'
```

## Notes

- The broker must be reachable from the ESP32 on the same network.
- Use the laptop or PC LAN IP in the ESP32 firmware, not `localhost`.
- For production, replace anonymous access with secure credentials and ACL-based authorization.

## GitHub push notes

Keep the config file and setup guide in the repository. Do not commit generated runtime logs or any custom local credentials.

