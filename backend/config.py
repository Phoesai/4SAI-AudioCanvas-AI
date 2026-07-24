import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Music Video Creator API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secrets & API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # File Storage Paths
    UPLOAD_DIR: Path = BASE_DIR / "temp" / "uploads"
    OUTPUT_DIR: Path = BASE_DIR / "temp" / "outputs"
    MAX_FILE_SIZE_MB: int = 50

    # Models
    GEMINI_TEXT_MODEL: str = "gemini-3.6-flash"
    GEMINI_IMAGE_MODEL: str = "gemini-3.1-flash-lite-image"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure temporary directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
