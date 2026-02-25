import random
from datetime import datetime, timedelta
from faker import Faker
from pymongo import MongoClient

# Import your working config
from backend.config import settings


# Connect using SAME config as FastAPI
client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]
logs_collection = db["logs"]

print("Connected to:", settings.MONGO_URI)
print("Database:", settings.DB_NAME)

fake = Faker()

SERVICES = [
    "auth-service",
    "payment-service",
    "order-service",
    "inventory-service",
    "notification-service",
    "gateway-service"
]

LEVELS = ["INFO", "WARNING", "ERROR"]

INFO_MESSAGES = [
    "User logged in successfully",
    "Order processed successfully",
    "Payment completed",
    "Session validated",
    "Data fetched successfully"
]

WARNING_MESSAGES = [
    "Response time exceeded threshold",
    "High memory usage detected",
    "Retrying external API call",
    "Slow database query detected"
]

ERROR_MESSAGES = [
    "Database connection failed",
    "Payment gateway timeout",
    "Unauthorized access attempt",
    "Failed to process order",
    "Service unavailable"
]


def generate_log():
    level = random.choices(
        LEVELS,
        weights=[70, 20, 10],
        k=1
    )[0]

    if level == "INFO":
        message = random.choice(INFO_MESSAGES)
    elif level == "WARNING":
        message = random.choice(WARNING_MESSAGES)
    else:
        message = random.choice(ERROR_MESSAGES)

    return {
        "level": level,
        "message": message,
        "service_name": random.choice(SERVICES),
        "timestamp": datetime.utcnow() - timedelta(
            minutes=random.randint(0, 10000)
        )
    }


def seed_logs(n=10000):
    logs = [generate_log() for _ in range(n)]
    result = logs_collection.insert_many(logs)
    print(f"Inserted {len(result.inserted_ids)} logs successfully!")
    print("Total documents:", logs_collection.count_documents({}))


if __name__ == "__main__":
    seed_logs(10000)