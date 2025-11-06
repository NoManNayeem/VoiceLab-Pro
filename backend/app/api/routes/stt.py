"""STT routes."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/stt", tags=["stt"])


@router.get("/status")
async def get_stt_status():
    """Get STT service status."""
    return {
        "status": "coming_soon",
        "message": "Speech-to-Text feature is coming soon"
    }

