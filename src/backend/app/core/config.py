
import json
import os
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Application
    PROJECT_NAME: str = "CarePilot AI Backend"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Security & JWT
    # Set a unique, randomly generated SECRET_KEY in your local .env file.
    SECRET_KEY: str = "replace_with_a_secure_random_secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # Database
    DATABASE_URL: str = "sqlite:///./carepilot.db"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, value):
        """Accept a JSON array or a comma-separated list of origins."""
        if isinstance(value, str):
            value = value.strip()

            if not value:
                return []

            if value.startswith("["):
                value = json.loads(value)

            else:
                value = [origin.strip() for origin in value.split(",")]

        if not isinstance(value, list):
            raise ValueError(
                "BACKEND_CORS_ORIGINS must be a JSON array "
                "or comma-separated string"
            )

        if not all(isinstance(origin, str) and origin.strip() for origin in value):
            raise ValueError("Every CORS origin must be a non-empty string")

        return [origin.strip().rstrip("/") for origin in value]

    # Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024

    # Optional integrations
    UNITY_AR_URL: str = ""
    N8N_WEBHOOK_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
        enable_decoding=False,
    )


settings = Settings()

# Ensure the configured upload directory exists.
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
