from fastapi import APIRouter, HTTPException
from bson import ObjectId
from backend.database import mongodb
from backend.schemas import LogEntry

router = APIRouter(prefix="/api/logs", tags=["Logs"])


# CREATE
@router.post("/")
async def create_log(log: LogEntry):
    result = mongodb.logs_collection.insert_one(log.dict())
    return {"id": str(result.inserted_id)}


# READ ALL (with limit)
@router.get("/")
async def get_logs(limit: int = 100):
    logs = list(
        mongodb.logs_collection
        .find()
        .sort("timestamp", -1)
        .limit(limit)
    )

    for log in logs:
        log["_id"] = str(log["_id"])

    return logs


# READ ONE
@router.get("/{log_id}")
async def get_log(log_id: str):
    log = mongodb.logs_collection.find_one({"_id": ObjectId(log_id)})
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")

    log["_id"] = str(log["_id"])
    return log


# DELETE
@router.delete("/{log_id}")
async def delete_log(log_id: str):
    result = mongodb.logs_collection.delete_one({"_id": ObjectId(log_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Log not found")

    return {"message": "Log deleted successfully"}