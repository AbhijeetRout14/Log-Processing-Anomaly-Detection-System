# frontend/tests/test_logs.py
import sys
import os

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from datetime import datetime

client = TestClient(app)


def test_create_log():
    payload = {
        "level": "ERROR",
        "message": "Test log creation",
        "service": "test-service",
        "timestamp": datetime.utcnow().isoformat()
    }

    response = client.post("/api/logs/", json=payload)

    assert response.status_code == 200
    assert "id" in response.json()


def test_get_logs_filter_by_level():
    # Ensure at least one ERROR exists
    client.post("/api/logs/", json={
        "level": "ERROR",
        "message": "Filter test",
        "service": "filter-service",
        "timestamp": datetime.utcnow().isoformat()
    })

    response = client.get("/api/logs/?level=ERROR")

    assert response.status_code == 200

    data = response.json()
    assert "logs" in data

    for log in data["logs"]:
        assert log["level"] == "ERROR"


def test_batch_insert_logs():
    payload = [
        {
            "level": "INFO",
            "message": "Batch 1",
            "service": "batch-service",
            "timestamp": datetime.utcnow().isoformat()
        },
        {
            "level": "ERROR",
            "message": "Batch 2",
            "service": "batch-service",
            "timestamp": datetime.utcnow().isoformat()
        }
    ]

    response = client.post("/api/logs/batch", json=payload)

    assert response.status_code == 200
    assert response.json()["inserted_count"] == 2