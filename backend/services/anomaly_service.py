from datetime import datetime, timedelta
from backend.database import mongodb


class AnomalyService:

    # ===== CONFIGURATION =====
    WINDOW_MINUTES = 5
    ERROR_THRESHOLD = 20
    MOVING_AVG_MINUTES = 30
    COOLDOWN_MINUTES = 5

    @staticmethod
    def detect_error_spike():

        now = datetime.utcnow()
        window_start = now - timedelta(minutes=AnomalyService.WINDOW_MINUTES)

        # ===== CURRENT WINDOW ERROR COUNT =====
        error_logs = list(mongodb.logs_collection.find({
            "level": "ERROR",
            "timestamp": {"$gte": window_start, "$lte": now}
        }))

        error_count = len(error_logs)

        # ===== MOVING AVERAGE CALCULATION =====
        past_start = window_start - timedelta(minutes=AnomalyService.MOVING_AVG_MINUTES)

        past_count = mongodb.logs_collection.count_documents({
            "timestamp": {"$gte": past_start, "$lt": window_start}
        })

        moving_avg = (
            past_count / AnomalyService.MOVING_AVG_MINUTES
            if past_count > 0 else 0
        )

        anomaly_type = None
        severity = "LOW"

        # ===== SPIKE DETECTION =====
        if error_count > AnomalyService.ERROR_THRESHOLD:
            anomaly_type = "ERROR_SPIKE"
            severity = "HIGH" if error_count > 2 * AnomalyService.ERROR_THRESHOLD else "MEDIUM"

        # ===== PATTERN DETECTION (Sudden spike vs moving avg) =====
        elif moving_avg > 0 and error_count > 3 * moving_avg:
            anomaly_type = "VOLUME_SPIKE"
            severity = "MEDIUM"

        if anomaly_type:

            # ===== COOLDOWN CHECK =====
            recent_anomaly = mongodb.anomalies_collection.find_one({
                "type": anomaly_type,
                "detected_at": {
                    "$gte": now - timedelta(minutes=AnomalyService.COOLDOWN_MINUTES)
                }
            })

            if not recent_anomaly:

                anomaly_record = {
                    "detected_at": now,
                    "type": anomaly_type,
                    "severity": severity,
                    "affected_service": "MULTIPLE",
                    "error_count": error_count,
                    "window_start": window_start,
                    "window_end": now,
                    "log_references": [str(log["_id"]) for log in error_logs]
                }

                mongodb.anomalies_collection.insert_one(anomaly_record)

            return {
                "status": "ANOMALY DETECTED",
                "type": anomaly_type,
                "severity": severity,
                "error_count_last_5_min": error_count
            }

        return {
            "status": "NORMAL",
            "error_count_last_5_min": error_count
        }

    @staticmethod
    def get_anomaly_history(limit: int = 50):

        anomalies = list(
            mongodb.anomalies_collection
            .find()
            .sort("detected_at", -1)
            .limit(limit)
        )

        for anomaly in anomalies:
            anomaly["_id"] = str(anomaly["_id"])

        return anomalies
    
