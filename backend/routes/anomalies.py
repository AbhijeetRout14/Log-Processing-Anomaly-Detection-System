from fastapi import APIRouter, Query
from datetime import datetime
from backend.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])


# ===== CURRENT STATUS CHECK =====
@router.get("/")
async def detect_anomalies():
    return AnomalyService.detect_error_spike()


# ===== MANUAL DETECTION FOR TIME RANGE =====
@router.post("/detect")
async def run_detection():
    return AnomalyService.detect_error_spike()


# ===== HISTORY =====
@router.get("/history")
async def get_anomaly_history(limit: int = 50):
    return AnomalyService.get_anomaly_history(limit)

