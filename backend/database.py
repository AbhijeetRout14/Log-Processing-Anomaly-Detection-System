# MongoDB connection setup 
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from config import settings


class MongoDB:
    """
    MongoDB connection manager.
    """

    def __init__(self):
        self.client = None
        self.db = None
        self.logs_collection = None
        self.anomalies_collection = None

    def connect(self):
        """
        Establish connection to MongoDB.
        """
        try:
            self.client = MongoClient(settings.MONGO_URI)
            self.db = self.client[settings.DB_NAME]

            # Test connection
            self.client.admin.command("ping")

            # Initialize collections
            self.logs_collection = self.db["logs"]
            self.anomalies_collection = self.db["anomalies"]

            # Create indexes
            self._create_indexes()

            print("✅ MongoDB connected successfully")

        except ConnectionFailure as e:
            print("❌ MongoDB connection failed")
            raise e

    def _create_indexes(self):
        """
        Create indexes for faster queries.
        """
        self.logs_collection.create_index("timestamp")
        self.logs_collection.create_index("level")
        self.logs_collection.create_index("service_name")

        self.anomalies_collection.create_index("detected_at")
        self.anomalies_collection.create_index("severity")


# Singleton instance
mongodb = MongoDB()