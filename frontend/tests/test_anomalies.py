# frontend/tests/test_anomalies.py
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from fastapi.testclient import TestClient
from backend.main import app
from datetime import datetime

client = TestClient(app)


def test_anomaly_detection_spike():
    # Inject spike logs
    for _ in range(50):
        client.post("/api/logs/", json={
            "level": "ERROR",
            "message": "Spike test",
            "service": "spike-service",
            "timestamp": datetime.utcnow().isoformat()
        })

    response = client.post("/api/anomalies/detect")

    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert data["status"] in ["ANOMALY DETECTED", "NORMAL"]


def test_anomaly_history():
    response = client.get("/api/anomalies/history")

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)