from fastapi import APIRouter, HTTPException
from backend.schemas import LogEntry
from backend.services.log_service import LogService
from backend.database import mongodb

router = APIRouter(prefix="/api/logs", tags=["Logs"])


# CREATE
@router.post("/")
async def create_log(log: LogEntry):
    log_id = LogService.create_log(log.dict())
    return {"id": log_id}


# READ ALL (with limit)
@router.get("/")
async def get_logs(
    level: str = None,
    service: str = None,
    start_date: str = None,
    end_date: str = None,
    page: int = 1,
    limit: int = 10
):
    query = {}

    # Level filter
    if level:
        query["level"] = level

    # Service filter
    if service:
        query["service_name"] = service

    # Date filter
    if start_date and end_date:
        from datetime import datetime
        query["timestamp"] = {
            "$gte": datetime.fromisoformat(start_date.replace("Z", "")),
            "$lte": datetime.fromisoformat(end_date.replace("Z", ""))
        }

    skip = (page - 1) * limit

    logs_cursor = (
        mongodb.logs_collection
        .find(query)
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )

    logs = list(logs_cursor)

    total = mongodb.logs_collection.count_documents(query)

    for log in logs:
        log["_id"] = str(log["_id"])

    return {
        "logs": logs,
        "total": total,
        "page": page,
        "limit": limit
    }


# READ ONE
@router.get("/{log_id}")
async def get_log(log_id: str):
    log = LogService.get_log_by_id(log_id)

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    return log


# DELETE
@router.delete("/{log_id}")
async def delete_log(log_id: str):
    deleted = LogService.delete_log(log_id)

    if deleted == 0:
        raise HTTPException(status_code=404, detail="Log not found")

    return {"message": "Log deleted successfully"}

# Additional endpoint for error distribution by service
@router.get("/error-distribution")
async def error_distribution():
    pipeline = [
        {"$match": {"level": "ERROR"}},
        {
            "$group": {
                "_id": "$service",
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"count": -1}}
    ]

    results = list(mongodb.logs_collection.aggregate(pipeline))

    formatted = [
        {"service": r["_id"], "count": r["count"]}
        for r in results
    ]

    return formatted