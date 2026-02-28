from fastapi import APIRouter, HTTPException
from datetime import datetime
from backend.schemas import LogEntry
from backend.database import mongodb
from bson import ObjectId

router = APIRouter(prefix="/api/logs", tags=["Logs"])


# ─────────────────────────────────────────────
# CREATE LOG
# ─────────────────────────────────────────────
@router.post("/")
async def create_log(log: LogEntry):
    log_dict = log.dict()

    # Force real datetime object
    log_dict["timestamp"] = datetime.utcnow()

    result = mongodb.logs_collection.insert_one(log_dict)

    return {"id": str(result.inserted_id)}


# ─────────────────────────────────────────────
# READ LOGS (FILTER + PAGINATION)
# ─────────────────────────────────────────────
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

    # Filter by level
    if level:
        query["level"] = level

    # Filter by service (IMPORTANT: match DB field name)
    if service:
        query["service_name"] = service

    # Filter by date range
    if start_date and end_date:
        try:
            start_dt = datetime.fromisoformat(start_date.replace("Z", ""))
            end_dt = datetime.fromisoformat(end_date.replace("Z", ""))
            
            query["timestamp"] = {
            "$gte": start_dt,
            "$lte": end_dt
            }

        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

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

    # Convert ObjectId to string
    for log in logs:
        log["_id"] = str(log["_id"])

    return {
        "logs": logs,
        "total": total,
        "page": page,
        "limit": limit
    }


# ─────────────────────────────────────────────
# READ ONE LOG
# ─────────────────────────────────────────────
@router.get("/{log_id}")
async def get_log(log_id: str):
    try:
        log = mongodb.logs_collection.find_one({"_id": ObjectId(log_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    log["_id"] = str(log["_id"])
    return log


# ─────────────────────────────────────────────
# DELETE LOG
# ─────────────────────────────────────────────
@router.delete("/{log_id}")
async def delete_log(log_id: str):
    try:
        result = mongodb.logs_collection.delete_one({"_id": ObjectId(log_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")

    return {"message": "Log deleted successfully"}