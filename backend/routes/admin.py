from fastapi import APIRouter
from datetime import datetime, timedelta
import random
from backend.database import mongodb

router = APIRouter(prefix="/api/admin", tags=["Admin"])

SERVICES = [
    "auth-service",
    "payment-service",
    "order-service",
    "inventory-service",
    "notification-service",
]

LEVELS = ["INFO", "WARNING", "ERROR"]

MESSAGES = {
    "INFO": ["User login", "Order completed", "Data fetched"],
    "WARNING": ["High memory usage", "Slow API response"],
    "ERROR": ["Database failure", "Payment timeout"]
}


@router.post("/seed")
async def seed_logs(count: int = 1000):
    logs = []

    for _ in range(count):
        level = random.choices(LEVELS, weights=[70, 20, 10])[0]

        log = {
            "level": level,
            "message": random.choice(MESSAGES[level]),
            "service_name": random.choice(SERVICES),
            "timestamp": datetime.utcnow() - timedelta(
                minutes=random.randint(0, 1000)
            )
        }

        logs.append(log)

    mongodb.logs_collection.insert_many(logs)

    return {"message": f"{count} logs generated successfully"}