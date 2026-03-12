from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cv2
import time
import json
import random

app = FastAPI(title="EcoNode Server")

# Allow React app to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mock ML & Firebase State ---
# In a real app, this would use firebase-admin and TFLite
latest_aqi = 45
firebase_state = {
    "command": "IDLE",
    "sensor_data": {}
}

class SensorData(BaseModel):
    pm25: float
    pm10: float
    temp: float
    humidity: float

@app.post("/ingest-sensor")
async def ingest_sensor(data: SensorData):
    """
    Receives raw sensor data from ESP32.
    Runs IIT Delhi Calibration Logic (Random Forest placeholder).
    """
    global latest_aqi
    # Placeholder Calibration: Tweak PM2.5 based on humidity
    calibrated_pm25 = data.pm25 * (1 + (data.humidity - 50) * 0.01)
    
    # Simple AQI calculation placeholder
    latest_aqi = int(calibrated_pm25 * 3.5)
    
    firebase_state["sensor_data"] = {
        "pm25": calibrated_pm25,
        "pm10": data.pm10,
        "temp": data.temp,
        "humidity": data.humidity,
        "aqi": latest_aqi
    }
    
    return {"status": "success", "calibrated_aqi": latest_aqi}


def generate_video_frames():
    """
    Reads from local USB webcam.
    Runs MobileNetV2 (mocked) to classify waste.
    """
    cap = cv2.VideoCapture(0) # 0 is usually the built-in or USB webcam
    
    # Wait for camera to warm up
    time.sleep(2)
    
    while True:
        success, frame = cap.read()
        if not success:
            break
            
        # --- MOCK ML INFERENCE ---
        # Simulate processing time
        # time.sleep(0.1) 
        
        # Randomly "detect" plastic to trigger the servo for demo purposes
        # In reality, this runs: interpreter.set_tensor(...); interpreter.invoke()
        if random.random() > 0.95:
            confidence = 0.85
            label = "Plastic (Segregated)"
            
            # TRIGGER ESP32 SERVO
            firebase_state["command"] = "OPEN_LID"
            
            # Draw Bounding Box
            cv2.rectangle(frame, (100, 100), (400, 400), (0, 255, 0), 2)
            cv2.putText(frame, f"{label} {confidence:.2f}", (100, 90), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)
        else:
            # Revert command
            firebase_state["command"] = "IDLE"

        # Encode frame for streaming
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.get("/video-feed")
async def video_feed():
    """Returns an MJPEG stream of the webcam with ML bounding boxes."""
    return StreamingResponse(generate_video_frames(), 
                             media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/policy-alert")
async def policy_alert():
    """
    Checks calibrated AQI and returns Constitutional/Policy alerts.
    """
    global latest_aqi
    if latest_aqi > 300:
        return {
            "status": "CRITICAL",
            "message": "Deploy Sprinklers immediately (Article 21 Compliance)",
            "aqi": latest_aqi
        }
    return {
        "status": "SAFE",
        "message": "Within safe limits",
        "aqi": latest_aqi
    }

# --- Mock Firebase Endpoint for ESP32 ---
@app.get("/command")
async def get_command():
    """ESP32 polls this to check if it should open the lid."""
    return {"command": firebase_state["command"]}

if __name__ == "__main__":
    import uvicorn
    # Run the server on all interfaces so the ESP32 can reach it on the local network
    uvicorn.run(app, host="0.0.0.0", port=8000)
