from fastapi import APIRouter
from backend.services.anomaly_service import AnomalyService

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])


@router.get("/")
async def detect_anomalies():
    return AnomalyService.detect_error_spike()


@router.get("/history")
async def get_anomaly_history(limit: int = 50):
    return AnomalyService.get_anomaly_history(limit)