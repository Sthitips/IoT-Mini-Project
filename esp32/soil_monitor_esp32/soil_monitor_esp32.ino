/*
 * Smart Soil Moisture Monitoring System - ESP32 Firmware
 * Hardware: ESP32 Dev Module + Analog Capacitive/Resistive Soil Moisture Sensor (GPIO 34)
 * Broker: broker.emqx.io:1883 (public MQTT)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// Wi-Fi credentials
const char* WIFI_SSID     = "mygigachigga";
const char* WIFI_PASSWORD = "SreyAnsu109";

// MQTT broker configuration
const char* MQTT_BROKER = "broker.emqx.io";
const int   MQTT_PORT   = 1883;
const char* DEVICE_ID   = "esp32-001";
const char* MQTT_TOPIC  = "soil-monitor/esp32-001/readings";

// Sensor pin (ADC1) and sampling rate
const int SENSOR_PIN = 34;
const unsigned long SEND_INTERVAL_MS = 2000;

// NTP configuration for UTC timestamps
const char* NTP_SERVER = "pool.ntp.org";
const long  GMT_OFFSET_SEC = 0;
const int   DAYLIGHT_OFFSET_SEC = 0;

WiFiClient espClient;
PubSubClient mqttClient(espClient);
unsigned long lastSendTime = 0;

void setupWiFi() {
  delay(10);
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected. IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WiFi] Connection failed. Will retry in loop.");
  }
}

void setupNTP() {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  struct tm timeinfo;
  if (getLocalTime(&timeinfo, 5000)) {
    Serial.println("[NTP] Time synchronized.");
  } else {
    Serial.println("[NTP] Sync pending, will retry.");
  }
}

// Returns ISO 8601 UTC timestamp or empty string if NTP is not yet synced
String getISO8601Timestamp() {
  struct tm timeinfo;
  if (getLocalTime(&timeinfo, 500)) {
    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buffer);
  }
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  return String("");
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.printf("[MQTT] Connecting to %s:%d...\n", MQTT_BROKER, MQTT_PORT);
    String clientId = "ESP32-" + String(random(0xffff), HEX);

    if (mqttClient.connect(clientId.c_str())) {
      Serial.println("[MQTT] Connected to broker.");
    } else {
      Serial.printf("[MQTT] Connection failed (rc=%d). Retrying in 3s...\n", mqttClient.state());
      delay(3000);
      if (WiFi.status() != WL_CONNECTED) {
        setupWiFi();
      }
    }
  }
}

// Multi-sample average to filter ADC voltage noise
int readMoistureSensorAveraged(int pin, int samples = 10) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return (int)(sum / samples);
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n--- AgroPulse ESP32 Starting ---");

  pinMode(SENSOR_PIN, INPUT);
  analogSetPinAttenuation(SENSOR_PIN, ADC_11db);

  setupWiFi();
  setupNTP();

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setBufferSize(512);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }

  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    lastSendTime = now;

    int rawValue = readMoistureSensorAveraged(SENSOR_PIN, 10);
    String timestamp = getISO8601Timestamp();

    StaticJsonDocument<256> doc;
    doc["device_id"] = DEVICE_ID;
    doc["raw_value"] = rawValue;
    doc["timestamp"] = timestamp;

    char jsonBuffer[256];
    serializeJson(doc, jsonBuffer);

    Serial.print("[MQTT] Publish: ");
    Serial.println(jsonBuffer);

    if (!mqttClient.publish(MQTT_TOPIC, jsonBuffer)) {
      Serial.println("[MQTT] Error: Publish failed!");
    }
  }
}