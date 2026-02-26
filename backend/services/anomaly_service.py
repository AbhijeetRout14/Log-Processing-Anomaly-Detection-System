from datetime import datetime, timedelta
from backend.database import mongodb


class AnomalyService:

    THRESHOLD = 20

    @staticmethod
    def detect_error_spike():
        five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)

        error_count = mongodb.logs_collection.count_documents({
            "level": "ERROR",
            "timestamp": {"$gte": five_minutes_ago}
        })

        if error_count > AnomalyService.THRESHOLD:

            # Check if recent anomaly already exists (cooldown 5 mins)
            recent_anomaly = mongodb.anomalies_collection.find_one({
                "type": "ERROR_SPIKE",
                "detected_at": {
                    "$gte": datetime.utcnow() - timedelta(minutes=5)
                }
            })

            if not recent_anomaly:
                anomaly_record = {
                    "type": "ERROR_SPIKE",
                    "error_count": error_count,
                    "detected_at": datetime.utcnow(),
                    "severity": "HIGH"
                }

                mongodb.anomalies_collection.insert_one(anomaly_record)

            return {
                "status": "ANOMALY DETECTED",
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