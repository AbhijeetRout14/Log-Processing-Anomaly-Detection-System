from pydantic import BaseModel, Field
from datetime import datetime

class LogEntry(BaseModel):
    level: str
    message: str
    service: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)