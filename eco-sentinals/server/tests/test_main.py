import pytest
import sys
import os

# Adjust path to import from server/ direct location
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
# Import App state correctly
from main import app

client = TestClient(app)

def test_ingest_sensor_valid():
    """Verify that sensor data is ingested and AQI is calibrated."""
    response = client.post("/ingest-sensor", json={
        "pm25": 10.0,
        "pm10": 20.0,
        "temp": 25.0,
        "humidity": 50.0
    })
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    # pm25 10 * 3.5 = 35 AQI (approx calibration multiplier)
    assert response.json()["calibrated_aqi"] > 0

def test_policy_alert_safe():
    """Verify that safe AQI returns SAFE status."""
    # Ingest low data
    client.post("/ingest-sensor", json={
        "pm25": 10.0,
        "pm10": 20.0,
        "temp": 25.0,
        "humidity": 50.0
    })
    
    response = client.get("/policy-alert")
    assert response.status_code == 200
    assert response.json()["status"] == "SAFE"

def test_policy_alert_critical():
    """Verify that high AQI returns CRITICAL status (AQI > 300)."""
    # Ingest high data: pm25=100 -> AQI approx 350
    client.post("/ingest-sensor", json={
        "pm25": 100.0,
        "pm10": 200.0,
        "temp": 25.0,
        "humidity": 50.0
    })
    
    response = client.get("/policy-alert")
    assert response.status_code == 200
    assert response.json()["status"] == "CRITICAL"
    assert response.json()["message"] == "Deploy Sprinklers immediately (Article 21 Compliance)"

def test_get_command():
    """Verify command polling yields correct structure."""
    response = client.get("/command")
    assert response.status_code == 200
    assert "command" in response.json()
