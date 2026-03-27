import pytest
import sys
import os

# Adjust path to import from server/ direct location
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from fastapi.testclient import TestClient
# Import App from new location app/main
from app.main import app

client = TestClient(app)

def get_auth_headers(ward_id: str = "ward_101"):
    """Helper to get auth headers for a ward."""
    response = client.post("/api/v1/auth/token", json={"ward_id": ward_id})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_ingest_sensor_valid():
    """Verify that sensor data is ingested with Auth and AQI is calibrated."""
    headers = get_auth_headers("ward_101")
    
    response = client.post("/api/v1/ingest-sensor", json={
        "pm25": 10.0,
        "pm10": 20.0,
        "temp": 25.0,
        "humidity": 50.0,
        "ward_id": "ward_101" # Required
    }, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["calibrated_aqi"] > 0

def test_ingest_sensor_isolation_forbidden():
    """Verify that a token for Ward A cannot ingest for Ward B."""
    headers = get_auth_headers("ward_101") # Token for ward_101
    
    response = client.post("/api/v1/ingest-sensor", json={
        "pm25": 10.0,
        "pm10": 20.0,
        "temp": 25.0,
        "humidity": 50.0,
        "ward_id": "ward_102" # Data claims ward_102
    }, headers=headers)
    
    assert response.status_code == 403 # Forbidden
    assert "Forbidden" in response.json()["detail"]

def test_get_command():
    """Verify command polling yields correct structure with Auth."""
    headers = get_auth_headers("ward_101")
    
    response = client.get("/api/v1/command", headers=headers)
    assert response.status_code == 200
    assert "command" in response.json()
    assert response.json()["ward_id"] == "ward_101"
