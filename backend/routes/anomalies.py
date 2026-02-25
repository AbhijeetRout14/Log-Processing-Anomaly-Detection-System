#Anomaly detection endpoints
from fastapi import APIRouter
from datetime import datetime, timedelta
from backend.database import mongodb

router = APIRouter(prefix="/api/anomalies", tags=["Anomalies"])

THRESHOLD = 20  # Adjust if needed


@router.get("/")
async def detect_anomalies():
    collection = mongodb.logs_collection

    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)

    error_count = collection.count_documents({
        "level": "ERROR",
        "timestamp": {"$gte": five_minutes_ago}
    })

    if error_count > THRESHOLD:
        return {
            "status": "ANOMALY DETECTED",
            "error_count_last_5_min": error_count
        }

    return {
        "status": "NORMAL",
        "error_count_last_5_min": error_count
    }