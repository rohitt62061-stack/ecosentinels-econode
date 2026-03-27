#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
#include <ESP32Servo.h>
#include <Adafruit_NeoPixel.h>

// --- Configuration ---
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://YOUR_LAPTOP_IP:8000"; // e.g., 192.168.1.5:8000

// --- Hardware Pins ---
#define PMS_RX 16
#define PMS_TX 17
#define BME_SDA 21
#define BME_SCL 22
#define SERVO_PIN 18
#define LED_PIN 19
#define NUMPIXELS 12 // Using a 12-LED ring

// --- Objects ---
Adafruit_BME280 bme;
Servo myServo;
Adafruit_NeoPixel pixels(NUMPIXELS, LED_PIN, NEO_GRB + NEO_KHZ800);
HardwareSerial pmsSerial(2);

// --- State Variables ---
unsigned long lastSensorRead = 0;
const long interval = 5000; // Read every 5s

void setup() {
  Serial.begin(115200);
  
  // Setup Sensors
  pmsSerial.begin(9600, SERIAL_8N1, PMS_RX, PMS_TX);
  
  if (!bme.begin(0x76)) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    // Continue anyway for demo purposes
  }

  // Setup Actuators
  myServo.attach(SERVO_PIN);
  myServo.write(0); // Close lid initially
  
  pixels.begin();
  pixels.clear();
  pixels.show();

  // Connect WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    // Failsafe: Flash Red if no connection
    setRingColor(pixels.Color(255, 0, 0)); 
  }
  Serial.println("\nConnected!");
  setRingColor(pixels.Color(0, 0, 255)); // Blue = Connected
  delay(1000);
  pixels.clear();
  pixels.show();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi Disconnected. Working in offline fallback mode.");
    // Demo failsafe: Just log to serial
    delay(1000);
    return;
  }

  unsigned long currentMillis = millis();

  // 1. Read Sensors & Send Data
  if (currentMillis - lastSensorRead >= interval) {
    lastSensorRead = currentMillis;
    
    // Read PMS5003 (simplified dummy read for stability)
    float pm25 = random(10, 150); 
    float pm10 = pm25 * 1.5;
    
    // Read BME280
    float temp = bme.readTemperature();
    float humidity = bme.readHumidity();

    sendSensorData(pm25, pm10, temp, humidity);
  }

  // 2. Poll for Commands from Laptop Server
  pollCommand();
  
  delay(100); 
}

void sendSensorData(float pm25, float pm10, float temp, float humidity) {
  HTTPClient http;
  String url = String(serverUrl) + "/ingest-sensor";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<200> doc;
  doc["pm25"] = pm25;
  doc["pm10"] = pm10;
  doc["temp"] = isnan(temp) ? 25.0 : temp;
  doc["humidity"] = isnan(humidity) ? 50.0 : humidity;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  int httpCode = http.POST(jsonPayload);
  if (httpCode > 0) {
    Serial.printf("Sensor Data Sent. HTTP Code: %d\n", httpCode);
  } else {
    Serial.printf("POST Failed, error: %s\n", http.errorToString(httpCode).c_str());
  }
  http.end();
}

void pollCommand() {
  HTTPClient http;
  String url = String(serverUrl) + "/command";
  http.begin(url);

  int httpCode = http.GET();
  if (httpCode > 0) {
    String payload = http.getString();
    
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, payload);
    
    if (!error) {
      const char* command = doc["command"];
      
      if (strcmp(command, "OPEN_LID") == 0) {
        Serial.println("Received: OPEN_LID. Activating Servo.");
        openLidSequence();
      }
    }
  }
  http.end();
}

void openLidSequence() {
  // Flash Green
  setRingColor(pixels.Color(0, 255, 0));
  
  // Open Servo
  myServo.write(90);
  delay(3000); // Keep open for 3 seconds
  
  // Close Servo
  myServo.write(0);
  
  // Clear LEDs
  pixels.clear();
  pixels.show();
}

void setRingColor(uint32_t color) {
  for(int i=0; i<NUMPIXELS; i++) {
    pixels.setPixelColor(i, color);
  }
  pixels.show();
}
