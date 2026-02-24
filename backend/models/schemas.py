#Pydantic models for request/response
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field, validator


# ==========================================================
# LOG SCHEMA MODELS
# ==========================================================

class LogBase(BaseModel):
    """
    Base schema representing a log document structure.
    """

    timestamp: datetime = Field(
        ...,
        description="Timestamp when the log was generated"
    )

    level: str = Field(
        ...,
        description="Log level (INFO, WARN, ERROR, CRITICAL)"
    )

    service_name: str = Field(
        ...,
        description="Name of the service generating the log"
    )

    message: str = Field(
        ...,
        description="Log message content"
    )

    response_time: Optional[int] = Field(
        None,
        description="Response time in milliseconds"
    )

    error_code: Optional[int] = Field(
        None,
        description="Associated error code if applicable"
    )

    metadata: Optional[Dict] = Field(
        default_factory=dict,
        description="Additional metadata as key-value pairs"
    )

    # Optional: validate allowed levels
    @validator("level")
    def validate_level(cls, value):
        allowed_levels = {"INFO", "WARN", "ERROR", "CRITICAL"}
        if value not in allowed_levels:
            raise ValueError(f"Level must be one of {allowed_levels}")
        return value


class LogCreate(LogBase):
    """
    Schema used for creating a new log entry (POST /api/logs).
    """
    pass


class LogResponse(LogBase):
    """
    Schema returned when sending log data to the client.
    """

    id: str = Field(..., description="Unique identifier of the log entry")

    class Config:
        orm_mode = True


class LogQueryParams(BaseModel):
    """
    Schema for filtering logs via query parameters.
    """

    level: Optional[str] = None
    service: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    page: int = 1
    limit: int = 10


class LogListResponse(BaseModel):
    """
    Schema for paginated log response.
    """

    logs: List[LogResponse]
    total: int
    page: int