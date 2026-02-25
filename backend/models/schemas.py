#Pydantic models for request/response
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class LogEntry(BaseModel):
    timestamp: datetime
    level: str = Field(..., example="ERROR")
    service_name: str = Field(..., example="auth-service")
    message: str = Field(..., example="Database connection failed")
    response_time: Optional[float] = Field(None, example=120.5)
    error_code: Optional[int] = Field(None, example=500)


class LogQuery(BaseModel):
    level: Optional[str] = None
    service: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = 1
    limit: int = 10


class LogResponse(BaseModel):
    logs: List[LogEntry]
    total: int
    page: int
    limit: int