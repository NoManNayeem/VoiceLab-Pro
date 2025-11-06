"""Database configuration and session management."""
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, DisconnectionError
from app.config import get_settings
import time
import logging

logger = logging.getLogger(__name__)

# Database engine will be initialized after settings are loaded
engine = None


def init_database():
    """Initialize database engine with settings."""
    global engine, SessionLocal
    settings = get_settings()
    
    # Create database engine with connection retry logic
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600,
        connect_args={
            "connect_timeout": 10,
            "options": "-c statement_timeout=30000"
        }
    )
    
    # Create session factory
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def retry_db_connection(max_retries=5, delay=2):
    """
    Retry database connection with exponential backoff.
    
    Args:
        max_retries: Maximum number of retry attempts
        delay: Initial delay in seconds
    
    Returns:
        True if connection successful, False otherwise
    """
    if engine is None:
        raise RuntimeError("Database engine not initialized. Call init_database() first.")
    
    for attempt in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return True
        except (OperationalError, DisconnectionError) as e:
            if attempt < max_retries - 1:
                wait_time = delay * (2 ** attempt)
                logger.warning(
                    f"Database connection failed (attempt {attempt + 1}/{max_retries}). "
                    f"Retrying in {wait_time} seconds... Error: {str(e)}"
                )
                time.sleep(wait_time)
            else:
                logger.error(
                    f"Database connection failed after {max_retries} attempts. "
                    f"Error: {str(e)}"
                )
                raise
    return False


# Session factory will be initialized by init_database()
SessionLocal = None

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session with retry logic."""
    if SessionLocal is None:
        raise RuntimeError("Database not initialized. Please ensure init_database() was called.")
    
    db = SessionLocal()
    try:
        yield db
    except (OperationalError, DisconnectionError) as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        # Retry once
        try:
            db = SessionLocal()
            yield db
        except Exception as retry_error:
            logger.error(f"Database retry failed: {retry_error}")
            raise
    finally:
        db.close()

