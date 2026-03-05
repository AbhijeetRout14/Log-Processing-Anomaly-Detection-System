import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    def __init__(self):
        self.MONGO_URI = os.getenv("MONGO_URI")
        self.DB_NAME = os.getenv("DB_NAME", "log_system")

        if not self.MONGO_URI:
            raise ValueError("MONGO_URI is not set in the .env file")


settings = Settings()