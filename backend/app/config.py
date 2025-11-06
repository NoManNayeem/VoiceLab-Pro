"""Configuration management for the application."""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional

# Load .env file using python-dotenv
# Try multiple paths to find .env file
env_paths = [
    Path("/app/.env"),  # Docker container path (when backend is mounted at /app)
    Path(__file__).parent.parent / ".env",  # Local development (backend/.env)
    Path(__file__).parent.parent.parent / ".env",  # Alternative local path
    Path(".env"),  # Current directory
]

# Load .env file - python-dotenv will load it into os.environ
env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)
        env_loaded = True
        break

# Also try default location (current working directory)
if not env_loaded:
    load_dotenv(override=True)


class ConfigurationError(Exception):
    """Raised when required configuration is missing."""
    pass


def get_env_or_error(key: str, default: Optional[str] = None, required: bool = False) -> str:
    """
    Get environment variable or raise error if required and missing.
    
    Args:
        key: Environment variable key
        default: Default value if not found
        required: Whether the variable is required
    
    Returns:
        Environment variable value
    
    Raises:
        ConfigurationError: If required variable is missing
    """
    value = os.getenv(key, default)
    
    if required and (value is None or value == ""):
        raise ConfigurationError(
            f"Required environment variable '{key}' is not set. "
            f"Please set it in your .env file or environment."
        )
    
    return value or ""


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = ""
    postgres_user: str = ""
    postgres_password: str = ""
    postgres_db: str = ""
    postgres_host: str = ""
    db_port: int = 5432
    
    # ElevenLabs
    elevenlabs_api_key: str = ""
    
    # FastAPI
    secret_key: str = ""
    environment: str = "development"
    
    # CORS
    frontend_url: str = "http://localhost:3000"
    
    def __init__(self, **kwargs):
        """Initialize settings with validation."""
        super().__init__(**kwargs)
        
        # Database configuration
        self.postgres_user = get_env_or_error("POSTGRES_USER", "voicelab_user")
        self.postgres_password = get_env_or_error("POSTGRES_PASSWORD", "voicelab_password")
        self.postgres_db = get_env_or_error("POSTGRES_DB", "voicelab_pro")
        self.postgres_host = get_env_or_error("POSTGRES_HOST", "localhost")
        self.db_port = int(get_env_or_error("DB_PORT", "5432"))
        
        # Build DATABASE_URL if not provided, or fix hostname if needed
        database_url_from_env = os.getenv("DATABASE_URL", "")
        if database_url_from_env:
            # If DATABASE_URL is set, use it but ensure hostname is correct for Docker
            # Replace localhost with the actual host from POSTGRES_HOST
            if "localhost" in database_url_from_env and self.postgres_host != "localhost":
                database_url_from_env = database_url_from_env.replace("localhost", self.postgres_host)
            self.database_url = database_url_from_env
        else:
            # Build DATABASE_URL from components
            self.database_url = (
                f"postgresql://{self.postgres_user}:{self.postgres_password}"
                f"@{self.postgres_host}:{self.db_port}/{self.postgres_db}"
            )
        
        # FastAPI configuration
        self.secret_key = get_env_or_error(
            "SECRET_KEY",
            "change-this-secret-key-in-production"
        )
        self.environment = get_env_or_error("ENVIRONMENT", "development")
        
        # CORS
        self.frontend_url = get_env_or_error("FRONTEND_URL", "http://localhost:3000")
        
        # ElevenLabs - get from environment (env_file loads into os.environ)
        # Check environment variable directly since env_file should have loaded it
        elevenlabs_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
        self.elevenlabs_api_key = elevenlabs_key
        
        # Only warn if truly missing (use logging instead of warnings for cleaner output)
        if not self.elevenlabs_api_key:
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(
                "ELEVENLABS_API_KEY is not set. TTS functionality will not work. "
                "Please set it in your .env file or environment variables."
            )
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance with validation."""
    try:
        return Settings()
    except ConfigurationError as e:
        print(f"\n❌ Configuration Error: {e}\n")
        print("Please check your .env file and ensure all required variables are set.")
        print("You can copy backend/.env.example to backend/.env and update the values.\n")
        raise

