import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    MONGO_URI: str = "mongodb+srv://abhijeetgudu2014_db_user:QIQIeSWhSzI6BZAX@project1.apmh8yn.mongodb.net/"
    DB_NAME: str = "log_system"


settings = Settings()