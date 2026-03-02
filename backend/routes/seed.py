from fastapi import APIRouter
from datetime import datetime
import random
from backend.database import mongodb

router = APIRouter(prefix="/api/seed", tags=["Seed"])


@router.post("/")
async def seed_logs(count: int = 200):
    levels = ["INFO", "WARNING", "ERROR"]
    services = ["auth-service", "payment-service", "db-service"]

    logs = []

    for _ in range(count):
        logs.append({
            "level": random.choice(levels),
            "service": random.choice(services),
            "message": "Seed generated log",
            "timestamp": datetime.utcnow()
        })

    mongodb.logs_collection.insert_many(logs)

    return {"message": f"{count} logs seeded successfully"}