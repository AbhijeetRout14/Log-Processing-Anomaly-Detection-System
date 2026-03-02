# MongoDB connection setup

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from backend.config import settings


class MongoDB:

    def __init__(self):
        self.client = None
        self.db = None
        self.logs_collection = None
        self.anomalies_collection = None

    def connect(self):
        self.client = MongoClient(settings.MONGO_URI)
        self.db = self.client[settings.DB_NAME]

        self.client.admin.command("ping")

        self.logs_collection = self.db["logs"]
        self.anomalies_collection = self.db["anomalies"]

        self._create_indexes()

    def _create_indexes(self):
        if self.logs_collection is not None:
            self.logs_collection.create_index("timestamp")
            self.logs_collection.create_index("level")
            self.logs_collection.create_index("service")

        if self.anomalies_collection is not None:
            self.anomalies_collection.create_index("detected_at")
            self.anomalies_collection.create_index("severity")

print("Connected to:", settings.MONGO_URI)
print("Database:", settings.DB_NAME)

# Singleton instance
mongodb = MongoDB()
mongodb.connect()