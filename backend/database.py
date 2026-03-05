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
        try:
            self.client = MongoClient(settings.MONGO_URI)

            # Test connection
            self.client.admin.command("ping")

            self.db = self.client[settings.DB_NAME]

            self.logs_collection = self.db["logs"]
            self.anomalies_collection = self.db["anomalies"]

            self._create_indexes()

            print("✅ Successfully connected to MongoDB")
            print(f"📂 Database: {settings.DB_NAME}")

        except ConnectionFailure as e:
            print("❌ MongoDB connection failed")
            print(f"Error: {e}")
            raise e

    def _create_indexes(self):
        if self.logs_collection is not None:
            self.logs_collection.create_index("timestamp")
            self.logs_collection.create_index("level")
            self.logs_collection.create_index("service")

        if self.anomalies_collection is not None:
            self.anomalies_collection.create_index("detected_at")
            self.anomalies_collection.create_index("severity")


# Singleton instance
mongodb = MongoDB()
mongodb.connect()