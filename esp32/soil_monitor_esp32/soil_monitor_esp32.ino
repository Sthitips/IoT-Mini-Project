/*
 * 🌱 Smart Soil Moisture Monitoring System - ESP32 Firmware
 * Target Board: ESP32 Dev Module
 * MQTT: broker.emqx.io (public, no auth, port 1883)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <time.h>

// ==========================================
// 1. NETWORK & MQTT CONFIGURATION
// ==========================================
const char* WIFI_SSID     = "mygigachigga";
const char* WIFI_PASSWORD = "SreyAnsu109";

// ── Public EMQX broker — no signup needed ──
const char* MQTT_BROKER   = "broker.emqx.io";
const int   MQTT_PORT     = 1883;
const char* MQTT_USER     = "";   // no auth
const char* MQTT_PASS     = "";   // no auth
// ───────────────────────────────────────────

// Device identity and MQTT topic
const char* DEVICE_ID     = "esp32-001";
const char* MQTT_TOPIC    = "soil-monitor/esp32-001/readings";

// ==========================================
// 2. HARDWARE & TIMING SETTINGS
// ==========================================
const int SENSOR_PIN = 34;
const unsigned long SEND_INTERVAL_MS = 2000;

// NTP settings for ISO timestamps
const char* NTP_SERVER = "pool.ntp.org";
const long  GMT_OFFSET_SEC = 0;
const int   DAYLIGHT_OFFSET_SEC = 0;

// ==========================================
// 3. GLOBAL OBJECTS (plain WiFiClient, no TLS)
// ==========================================
WiFiClient espClient;
PubSubClient mqttClient(espClient);
unsigned long lastSendTime = 0;

// ==========================================
// 4. HELPER FUNCTIONS
// ==========================================

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to Wi-Fi SSID: ");
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
    Serial.println("\n[WiFi] Connected successfully!");
    Serial.print("[WiFi] ESP32 IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Connection failed. Will retry in loop.");
  }
}

void setupNTP() {
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  Serial.println("[NTP] Synchronizing time...");
  struct tm timeinfo;
  if (getLocalTime(&timeinfo, 5000)) {
    Serial.println("[NTP] Time synchronized successfully.");
  } else {
    Serial.println("[NTP] Failed to obtain time.");
  }
}

String getISO8601Timestamp() {
  struct tm timeinfo;
  if (getLocalTime(&timeinfo, 500)) {
    char buffer[30];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
    return String(buffer);
  }

  // If NTP not yet synced, try re-syncing in background
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  // Return empty so backend assigns true current UTC time
  return String("");
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Attempting connection to broker: ");
    Serial.print(MQTT_BROKER);
    Serial.print(":");
    Serial.println(MQTT_PORT);

    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    bool connected = false;
    if (MQTT_USER && strlen(MQTT_USER) > 0) {
      connected = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASS);
    } else {
      connected = mqttClient.connect(clientId.c_str());
    }

    if (connected) {
      Serial.println("[MQTT] Connected successfully to HiveMQ Cloud!");
    } else {
      Serial.print("[MQTT] Connection failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(". Retrying in 3 seconds...");
      delay(3000);

      if (WiFi.status() != WL_CONNECTED) {
        setupWiFi();
      }
    }
  }
}

int readMoistureSensorAveraged(int pin, int samples = 10) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(10);
  }
  return (int)(sum / samples);
}

// ==========================================
// 5. MAIN SETUP & LOOP
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n==========================================");
  Serial.println("🌱 ESP32 Soil Moisture Sensor Starting...");
  Serial.println("==========================================");

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

    Serial.print("[MQTT] Publishing to '");
    Serial.print(MQTT_TOPIC);
    Serial.print("': ");
    Serial.println(jsonBuffer);

    bool success = mqttClient.publish(MQTT_TOPIC, jsonBuffer);
    if (!success) {
      Serial.println("[MQTT] ERROR: Failed to publish message!");
    }
  }
}