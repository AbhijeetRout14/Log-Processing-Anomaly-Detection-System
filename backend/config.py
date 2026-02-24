# Environment variables and settings
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """
    Application configuration settings loaded from environment variables.
    """

    MONGO_URI: str = os.getenv("MONGO_URI")
    DB_NAME: str = os.getenv("DB_NAME", "log_system")


settings = Settings()