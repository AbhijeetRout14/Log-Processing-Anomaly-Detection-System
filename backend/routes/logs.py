from fastapi import APIRouter, HTTPException
from backend.schemas import LogEntry
from backend.services.log_service import LogService

router = APIRouter(prefix="/api/logs", tags=["Logs"])


# CREATE
@router.post("/")
async def create_log(log: LogEntry):
    log_id = LogService.create_log(log.dict())
    return {"id": log_id}


# READ ALL (with limit)
@router.get("/")
async def get_logs(limit: int = 100):
    return LogService.get_logs(limit)


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