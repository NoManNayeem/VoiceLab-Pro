"""TTS routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.tts import TTSGenerateRequest, TTSGenerateResponse, TTSHistoryResponse, TTSHistoryItem
from app.api.deps import get_current_user, get_current_user_from_request
from app.models.user import User
from app.models.tts_request import TTSRequest
from app.services.elevenlabs_service import generate_tts_audio, get_available_voices
from app.config import ConfigurationError
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tts", tags=["tts"])


@router.post("/generate", response_model=TTSGenerateResponse)
async def generate_tts(
    request_body: TTSGenerateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Generate TTS audio from text."""
    # Authenticate user using request-based dependency
    user = get_current_user_from_request(request, db)
    
    # Validate text
    if not request_body.text or len(request_body.text.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )
    
    try:
        # Generate audio using ElevenLabs (with retry logic and voice settings)
        audio_bytes = generate_tts_audio(
            text=request_body.text,
            voice_id=request_body.voice_id,
            max_retries=3,
            stability=request_body.stability,
            similarity_boost=request_body.similarity_boost,
            style=request_body.style,
            use_speaker_boost=request_body.use_speaker_boost,
            model_id=request_body.model_id,
            language=request_body.language
        )
        
        # Store request in database
        tts_request = TTSRequest(
            user_id=user.id,
            text=request_body.text,
            voice_id=request_body.voice_id,
            audio_url=None  # For POC, we return audio directly
        )
        db.add(tts_request)
        db.commit()
        db.refresh(tts_request)
        
        # Convert audio to base64 for response
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        audio_url = f"data:audio/mpeg;base64,{audio_base64}"
        
        # Update request with audio URL
        tts_request.audio_url = audio_url
        db.commit()
        
        return TTSGenerateResponse(
            request_id=tts_request.id,
            audio_url=audio_url,
            text=request_body.text,
            voice_id=request_body.voice_id,
            created_at=tts_request.created_at
        )
    except ConfigurationError as e:
        # Handle configuration/API key errors with clear messages
        error_detail = str(e)
        # Check if it's a service unavailable or unusual activity error
        if "temporarily unavailable" in error_detail.lower() or "unusual activity" in error_detail.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=error_detail
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail
        )
    except Exception as e:
        error_msg = str(e)
        # Check for 401/unauthorized errors from ElevenLabs
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            # If the error already contains a user-friendly message, use it
            if "temporarily unavailable" in error_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=error_msg
                )
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ElevenLabs service temporarily unavailable. Please try again in a moment or contact support.\n\n"
                       "If this persists, the service may be temporarily unavailable or your API key may need verification."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate audio: {error_msg}"
        )


@router.get("/history", response_model=TTSHistoryResponse)
async def get_tts_history(
    request: Request,
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """Get user's TTS generation history."""
    # Authenticate user using request-based dependency
    user = get_current_user_from_request(request, db)
    
    # Get user's TTS requests
    requests = db.query(TTSRequest).filter(
        TTSRequest.user_id == user.id
    ).order_by(
        TTSRequest.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    total = db.query(TTSRequest).filter(
        TTSRequest.user_id == user.id
    ).count()
    
    return TTSHistoryResponse(
        requests=[TTSHistoryItem.model_validate(req) for req in requests],
        total=total
    )


@router.get("/voices")
async def get_voices(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get list of available ElevenLabs voices."""
    # Authenticate user using request-based dependency
    user = get_current_user_from_request(request, db)
    
    try:
        voices = get_available_voices()
        return {"voices": voices}
    except ConfigurationError as e:
        # Handle configuration/API key errors with clear messages
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch voices: {str(e)}"
        )

