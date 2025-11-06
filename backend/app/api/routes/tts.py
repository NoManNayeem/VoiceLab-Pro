"""TTS routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.tts import TTSGenerateRequest, TTSGenerateResponse, TTSHistoryResponse, TTSHistoryItem
from app.api.deps import get_current_user
from app.models.user import User
from app.models.tts_request import TTSRequest
from app.services.elevenlabs_service import generate_tts_audio, get_available_voices
from app.config import ConfigurationError
import io
from typing import Optional

router = APIRouter(prefix="/api/tts", tags=["tts"])


@router.post("/generate", response_model=TTSGenerateResponse)
async def generate_tts(
    request: TTSGenerateRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Generate TTS audio from text."""
    # Authenticate user
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    user = get_current_user(token=token, db=db)
    
    # Validate text
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )
    
    try:
        # Generate audio using ElevenLabs (with retry logic and voice settings)
        audio_bytes = generate_tts_audio(
            text=request.text,
            voice_id=request.voice_id,
            max_retries=3,
            stability=request.stability,
            similarity_boost=request.similarity_boost,
            style=request.style,
            use_speaker_boost=request.use_speaker_boost,
            model_id=request.model_id,
            language=request.language
        )
        
        # Store request in database
        tts_request = TTSRequest(
            user_id=user.id,
            text=request.text,
            voice_id=request.voice_id,
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
            text=request.text,
            voice_id=request.voice_id,
            created_at=tts_request.created_at
        )
    except ConfigurationError as e:
        # Handle configuration/API key errors with clear messages
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate audio: {str(e)}"
        )


@router.get("/history", response_model=TTSHistoryResponse)
async def get_tts_history(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """Get user's TTS generation history."""
    # Authenticate user
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    user = get_current_user(token=token, db=db)
    
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
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get list of available ElevenLabs voices."""
    # Authenticate user
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    user = get_current_user(token=token, db=db)
    
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

