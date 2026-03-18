# EcoNode Setup Guide & Architecture Docs

## Overview
EcoNode is a dual-mode sentinel system for municipal governance, combining hyper-local AQI monitoring and gamified waste segregation, aligned with the 74th Amendment and Swachh Bharat 2.0.

*Detailed Design docs available for review in [System Architecture](file:///d:/safebrowser/ecosentinels-econode/eco-sentinals/docs/architecture/system-overview.md)*

It utilizes a "Split-Brain" architecture:
- **Edge Node (ESP32)**: Handles local sensors, LEDs, and servos reliably.
- **Brain (Laptop Server)**: Handles AI inference, webcam feed, and the frontend dashboard.

## Hardware Setup
Total BOM ~ ₹1,800
- **ESP32 DevKit V1**: Core controller (₹450)
- **PMS5003**: PM2.5/PM10 Sensor (₹1,000)
- **BME280**: Temperature/Humidity (₹150)
- **MG995 Servo**: Lid actuator (₹150)
- **WS2812B Ring**: Visual feedback (₹50)
- **USB Webcam**: Connected *directly* to laptop running the backend

### Wiring on ESP32
| Component | ESP32 Pin |
|-----------|-----------|
| PMS_RX    | GPIO 16   |
| PMS_TX    | GPIO 17   |
| BME_SDA   | GPIO 21   |
| BME_SCL   | GPIO 22   |
| SERVO_PWM | GPIO 18   |
| LED_DATA  | GPIO 19   |

## Software Setup

### 1. Firmware (`/firmware`)
- Open `firmware/econode.ino` in Arduino IDE or PlatformIO.
- Install necessary libraries (`ESP32Servo`, `Adafruit_NeoPixel`, `Adafruit_BME280`, `ArduinoJson`).
- **Critical**: Update `ssid`, `password`, and `serverUrl` (IP of your laptop running the backend) at the top of the sketch.
- Flash to ESP32.

### 2. Backend Server (`/server`)
- Requires Python 3.9+
- `cd server`
- Install requirements: `pip install -r requirements.txt`
- Run server: `python main.py` or `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
- Keep terminal open to view API logs.

### 3. Frontend Dashboards (`/client`)
- Requires Node.js (v18+)
- `cd client`
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- **MCD Dashboard**: Navigate to `http://localhost:5173/mcd-dashboard`
- **Citizen App**: Navigate to `http://localhost:5173/citizen-app`

## Using the System (Demo Flow)
1. Turn on ESP32. The LED ring should turn Blue once connected to WiFi.
2. ESP32 automatically starts sending mock/real sensor data to FastAPI.
3. Open the Citizen App. Click "Scan Waste".
4. The backend server camera feed (mocked detection logic) will simulate a $>90\%$ confidence "Plastic" detection.
5. Watch the ESP32: It will receive the `OPEN_LID` command from the server. The Servo will turn 90°, the LED ring will flash Green, and it will close after 3 seconds.
6. Open the MCD Dashboard. See the live telemetries from your "ward". When AQI crosses 300, a "Deploy Sprinklers (Article 21 Compliance)" policy alert triggers automatically.
