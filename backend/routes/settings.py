# backend/routes/settings.py

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# In-memory storage (replace with DB later)
settings_store = {
    "sensitivity": 7,
    "confidence": 85,
    "interval": 5
}

class SettingsUpdate(BaseModel):
    sensitivity: int
    confidence: int
    interval: int


@router.get("/settings")
async def get_settings():
    return settings_store


@router.put("/settings")
async def update_settings(data: SettingsUpdate):
    settings_store.update(data.dict())
    return {"message": "Settings updated successfully"}