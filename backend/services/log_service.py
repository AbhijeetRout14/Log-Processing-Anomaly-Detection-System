#Log business logic
# Log business logic

from bson import ObjectId
from datetime import datetime
from backend.database import mongodb


class LogService:

    @staticmethod
    def create_log(log_data: dict):
        log_data["timestamp"] = log_data.get("timestamp", datetime.utcnow())
        result = mongodb.logs_collection.insert_one(log_data)
        return str(result.inserted_id)

    @staticmethod
    def get_logs(limit: int = 100):
        logs = list(
            mongodb.logs_collection
            .find()
            .sort("timestamp", -1)
            .limit(limit)
        )

        for log in logs:
            log["_id"] = str(log["_id"])

        return logs

    @staticmethod
    def get_log_by_id(log_id: str):
        log = mongodb.logs_collection.find_one(
            {"_id": ObjectId(log_id)}
        )

        if log:
            log["_id"] = str(log["_id"])

        return log

    @staticmethod
    def delete_log(log_id: str):
        result = mongodb.logs_collection.delete_one(
            {"_id": ObjectId(log_id)}
        )
        return result.deleted_count
    
    @staticmethod
    def create_logs_batch(logs: list):
        result = mongodb.logs_collection.insert_many(logs)
        return len(result.inserted_ids)