"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings, ConfigurationError
from app.database import engine, Base, retry_db_connection
from app.api.routes import auth, tts, stt
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

try:
    settings = get_settings()
except ConfigurationError as e:
    logger.error(f"Configuration error: {e}")
    raise

# Initialize database
from app.database import init_database, retry_db_connection
try:
    logger.info("Initializing database connection...")
    init_database()
    logger.info("Verifying database connection...")
    retry_db_connection()
    # Create database tables
    from app.database import engine
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified successfully")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    logger.error("Please check your database configuration in .env file")
    raise

# Initialize FastAPI app
app = FastAPI(
    title="VoiceLab Pro API",
    description="TTS and STT platform API",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tts.router)
app.include_router(stt.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "VoiceLab Pro API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    try:
        # Check database connection
        from app.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        # Check ElevenLabs API key (if set)
        elevenlabs_status = "configured" if settings.elevenlabs_api_key else "not_configured"
        
        return {
            "status": "healthy",
            "database": "connected",
            "elevenlabs": elevenlabs_status
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "disconnected",
                "error": str(e)
            }
        )


@app.get("/api/elevenlabs/test")
async def test_elevenlabs():
    """Test ElevenLabs API key status and connectivity."""
    from app.services.elevenlabs_service import get_elevenlabs_client, get_available_voices
    from app.config import ConfigurationError
    
    if not settings.elevenlabs_api_key:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": "ELEVENLABS_API_KEY is not configured",
                "can_read": False,
                "can_generate": False
            }
        )
    
    try:
        # Test 1: Can we read voices? (read operation)
        client = get_elevenlabs_client()
        if client is None:
            return JSONResponse(
                status_code=400,
                content={
                    "status": "error",
                    "message": "Failed to initialize ElevenLabs client",
                    "can_read": False,
                    "can_generate": False
                }
            )
        
        voices = get_available_voices()
        can_read = True
        voices_count = len(voices) if voices else 0
        
        # Test 2: Can we generate audio? (write operation - this is where the block happens)
        can_generate = False
        generate_error = None
        try:
            # Try a minimal test generation
            audio_gen = client.text_to_speech.convert(
                "JBFqnCBsd6RMkjVDRZzb",  # Default voice
                text="Test",
                model_id="eleven_multilingual_v2",
                output_format="mp3_44100_128"
            )
            # Try to get first chunk (this triggers the actual API call)
            try:
                next(audio_gen)
                can_generate = True
            except StopIteration:
                can_generate = True  # Empty generator means it worked
            except Exception as e:
                error_msg = str(e)
                if "detected_unusual_activity" in error_msg:
                    generate_error = "Account/IP flagged for unusual activity"
                else:
                    generate_error = error_msg
        except Exception as e:
            error_msg = str(e)
            if "detected_unusual_activity" in error_msg:
                generate_error = "Account/IP flagged for unusual activity"
            else:
                generate_error = error_msg
        
        return {
            "status": "success",
            "api_key_configured": True,
            "can_read": can_read,
            "can_generate": can_generate,
            "voices_available": voices_count,
            "generate_error": generate_error,
            "message": "Can read voices but cannot generate audio" if can_read and not can_generate else "All operations working" if can_generate else "API key issue"
        }
        
    except ConfigurationError as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": str(e),
                "can_read": False,
                "can_generate": False
            }
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Unexpected error: {str(e)}",
                "can_read": False,
                "can_generate": False
            }
        )


@app.exception_handler(ConfigurationError)
async def configuration_error_handler(request, exc):
    """Handle configuration errors."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Configuration Error",
            "message": str(exc),
            "detail": "Please check your .env file and ensure all required variables are set."
        }
    )

