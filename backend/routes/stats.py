from fastapi import APIRouter
from backend.database import mongodb

router = APIRouter()

@router.get("/api/stats")
async def get_stats():
    collection = mongodb.logs_collection

    total_logs = collection.count_documents({})
    info_logs = collection.count_documents({"level": "INFO"})
    warning_logs = collection.count_documents({"level": "WARNING"})
    error_logs = collection.count_documents({"level": "ERROR"})

    pipeline = [
        {"$group": {"_id": "$service", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]

    top_service_result = list(collection.aggregate(pipeline))
    top_service = top_service_result[0]["_id"] if top_service_result else None

    return {
        "total_logs": total_logs,
        "info_logs": info_logs,
        "warning_logs": warning_logs,
        "error_logs": error_logs,
        "top_service": top_service
    }