#!/usr/bin/env python3
"""
🌱 ESP32 Soil Moisture Simulator
This script simulates an ESP32 device reading an analog soil moisture sensor
and publishing JSON payloads to a HiveMQ Cloud MQTT broker.

Usage:
    python3 simulate_esp32.py [options]

Options:
    --broker    MQTT Broker host (default: broker.hivemq.cloud)
    --port      MQTT Broker port (default: 8883)
    --device    Device ID (default: esp32-001)
    --interval  Publish interval in seconds (default: 2.0)
    --mode      Simulation mode: 'dry', 'wet', 'dynamic' (default: dynamic)
    --username  HiveMQ username
    --password  HiveMQ password
    --tls       Enable TLS for HiveMQ Cloud
"""

import sys
import time
import json
import random
import argparse
from datetime import datetime, timezone
import paho.mqtt.client as mqtt


def get_simulated_raw_value(mode: str, step: int) -> int:
    """
    Generate realistic raw ADC values (0 - 4095) for capacitive soil sensor.
    - Dry soil: ~3000 to ~3300
    - Wet soil: ~1200 to ~1600
    - Dynamic: oscillates naturally between wet and dry to simulate drying soil
    """
    if mode == "dry":
        return int(random.gauss(3100, 30))
    elif mode == "wet":
        return int(random.gauss(1400, 30))
    else:  # dynamic
        # Simulate soil drying over time with small noise
        base = 1500 + (step % 40) * 40
        noise = random.randint(-25, 25)
        return max(1000, min(3600, base + noise))


def main():
    parser = argparse.ArgumentParser(description="Simulate ESP32 Soil Sensor publishing to MQTT")
    parser.add_argument("--broker", default="broker.emqx.io", help="MQTT Broker host (default: broker.emqx.io)")
    parser.add_argument("--port", type=int, default=1883, help="MQTT Broker port (default: 1883)")
    parser.add_argument("--device", default="esp32-001", help="Device ID (default: esp32-001)")
    parser.add_argument("--interval", type=float, default=2.0, help="Interval in seconds (default: 2.0)")
    parser.add_argument("--mode", choices=["dry", "wet", "dynamic"], default="dynamic", help="Simulation mode")
    parser.add_argument("--username", default=None, help="MQTT username (optional)")
    parser.add_argument("--password", default=None, help="MQTT password (optional)")
    parser.add_argument("--tls", action="store_true", help="Enable TLS (optional)")
    args = parser.parse_args()

    topic = f"soil-monitor/{args.device}/readings"

    if hasattr(mqtt, "CallbackAPIVersion"):
        client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION1, client_id="esp32_soil_simulator")
    else:
        client = mqtt.Client(client_id="esp32_soil_simulator")

    if args.username and args.password:
        client.username_pw_set(args.username, args.password)

    if args.tls:
        client.tls_set()
        client.tls_insecure_set(True)

    print("==================================================")
    print(f"🌱 ESP32 Simulator started for device '{args.device}'")
    print(f"Connecting to MQTT Broker at {args.broker}:{args.port}...")
    print(f"Publishing to topic: {topic}")
    print("==================================================")

    try:
        client.connect(args.broker, args.port, 60)
        client.loop_start()
    except Exception as e:
        print(f"❌ Failed to connect to HiveMQ broker: {e}")
        print("Example: python3 simulate_esp32.py --broker broker.hivemq.cloud --port 8883 --tls --username USER --password PASS")
        sys.exit(1)

    step = 0
    try:
        while True:
            raw_val = get_simulated_raw_value(args.mode, step)
            ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

            payload = {
                "device_id": args.device,
                "raw_value": raw_val,
                "timestamp": ts
            }

            payload_json = json.dumps(payload)
            res = client.publish(topic, payload_json)
            if res.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"[SENT] {ts} -> raw_value: {raw_val:4d} | payload: {payload_json}")
            else:
                print(f"[ERROR] Publish failed with code {res.rc}")

            step += 1
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nStopping ESP32 Simulator...")
    finally:
        client.loop_stop()
        client.disconnect()
        print("Disconnected.")


if __name__ == "__main__":
    main()
