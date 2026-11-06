import os
import json
import logging
from typing import Optional
import paho.mqtt.client as mqtt

from app.schemas.sensor import SensorReading
from app.services.storage import process_and_save_reading

logger = logging.getLogger("mqtt_subscriber")
logging.basicConfig(level=logging.INFO)

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "soil-monitor/+/readings")
MQTT_USERNAME = os.getenv("MQTT_USERNAME", None)
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", None)

_client: Optional[mqtt.Client] = None


def on_connect(client, userdata, flags, rc, *args):
    """
    Callback when broker connection is established.
    Works across paho-mqtt v1.x and v2.x.
    """
    # In paho-mqtt v2, rc is a ReasonCode object; in v1 it is an int
    rc_code = getattr(rc, "value", rc)
    if rc_code == 0:
        logger.info(f"[MQTT] Connected successfully to broker at {MQTT_BROKER}:{MQTT_PORT}")
        client.subscribe(MQTT_TOPIC)
        logger.info(f"[MQTT] Subscribed to topic: {MQTT_TOPIC}")
    else:
        logger.error(f"[MQTT] Connection failed with result code {rc}")


def on_disconnect(client, userdata, rc, *args):
    rc_code = getattr(rc, "value", rc)
    if rc_code != 0:
        logger.warning(f"[MQTT] Unexpected disconnection (rc={rc}). Will auto-reconnect...")
    else:
        logger.info("[MQTT] Disconnected from broker.")


def on_message(client, userdata, msg):
    """
    Process incoming MQTT message containing soil moisture reading.
    """
    try:
        payload_str = msg.payload.decode("utf-8")
        data = json.loads(payload_str)
        
        # Guard against empty, null or missing timestamp
        raw_ts = data.get("timestamp")
        if not raw_ts or str(raw_ts).strip() in ("", "None", "null"):
            data["timestamp"] = None

        reading = SensorReading(**data)
        stored = process_and_save_reading(reading)
        
        logger.info(
            f"[MQTT] Processed reading from {stored.device_id}: "
            f"raw={stored.raw_value} -> moisture={stored.moisture}%"
        )
    except json.JSONDecodeError as e:
        logger.error(f"[MQTT] Invalid JSON payload received on {msg.topic}: {e}")
    except Exception as e:
        logger.error(f"[MQTT] Error handling message on {msg.topic}: {e}")


def start_mqtt():
    """
    Initialize and start MQTT subscriber in background thread.
    """
    global _client
    if _client is not None:
        return

    # Check for paho-mqtt v2 CallbackAPIVersion support
    if hasattr(mqtt, "CallbackAPIVersion"):
        _client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION1,
            client_id="fastapi_soil_monitor_subscriber"
        )
    else:
        _client = mqtt.Client(client_id="fastapi_soil_monitor_subscriber")

    if MQTT_USERNAME and MQTT_PASSWORD:
        _client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    _client.on_connect = on_connect
    _client.on_disconnect = on_disconnect
    _client.on_message = on_message

    logger.info(f"[MQTT] Connecting to {MQTT_BROKER}:{MQTT_PORT}...")
    try:
        _client.connect_async(MQTT_BROKER, MQTT_PORT, keepalive=60)
        _client.loop_start()
    except Exception as e:
        logger.error(f"[MQTT] Could not initiate connection to MQTT broker: {e}")


def stop_mqtt():
    """
    Disconnect and stop background MQTT loop.
    """
    global _client
    if _client is not None:
        try:
            _client.loop_stop()
            _client.disconnect()
            logger.info("[MQTT] Stopped MQTT loop and disconnected.")
        except Exception as e:
            logger.error(f"[MQTT] Error during shutdown: {e}")
        finally:
            _client = None