from datetime import datetime
from pymongo import MongoClient

# 🔹 Atlas Connection
MONGO_URI = "mongodb+srv://abhijeetgudu2014_db_user:QIQIeSWhSzI6BZAX@project1.apmh8yn.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = "log_system"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db["logs"]

print("Connected to:", DB_NAME)

updated_count = 0

for log in collection.find():
    if isinstance(log.get("timestamp"), str):
        try:
            new_time = datetime.fromisoformat(log["timestamp"])
            collection.update_one(
                {"_id": log["_id"]},
                {"$set": {"timestamp": new_time}}
            )
            print("Updated:", log["_id"])
            updated_count += 1
        except Exception as e:
            print("Skipped:", log["_id"], e)

print(f"\nMigration complete. {updated_count} documents updated.")