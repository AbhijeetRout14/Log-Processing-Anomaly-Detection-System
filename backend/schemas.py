from pydantic import BaseModel, Field
from datetime import datetime

class LogEntry(BaseModel):
    level: str
    service: str
    message: str
    response_time: int | None = None
    timestamp: datetime | None = None