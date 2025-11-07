"""Cartesia AI TTS routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Header, Cookie, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user, get_current_user_from_request
from app.services.cartesia_service import (
    generate_tts_audio,
    get_available_voices,
    get_available_models,
    get_available_languages,
)
from app.config import ConfigurationError
import io
from typing import Optional
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/api/cartesia", tags=["cartesia"])


class CartesiaGenerateRequest(BaseModel):
    """Request model for Cartesia TTS generation."""
    text: str
    voice_id: Optional[str] = None
    model_id: str = "sonic-3"
    language: Optional[str] = None
    speed: float = 1.0
    volume: float = 1.0
    emotion: str = "neutral"


class CartesiaGenerateResponse(BaseModel):
    """Response model for Cartesia TTS generation."""
    request_id: UUID
    audio_url: str
    text: str
    voice_id: Optional[str]
    created_at: datetime


@router.post("/generate", response_model=CartesiaGenerateResponse)
async def generate_cartesia_tts(
    request_body: CartesiaGenerateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Generate TTS audio using Cartesia AI."""
    # Authenticate user using request-based dependency
    user = get_current_user_from_request(request, db)
    
    # Validate text
    if not request_body.text or len(request_body.text.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )
    
    try:
        # Generate audio using Cartesia
        audio_bytes = generate_tts_audio(
            text=request_body.text,
            voice_id=request_body.voice_id,
            model_id=request_body.model_id,
            language=request_body.language,
            speed=request_body.speed,
            volume=request_body.volume,
            emotion=request_body.emotion,
        )
        
        # Store request in database (reuse TTSRequest model)
        from app.models.tts_request import TTSRequest
        tts_request = TTSRequest(
            user_id=user.id,
            text=request_body.text,
            voice_id=request_body.voice_id or "cartesia-default",
            audio_url=None
        )
        db.add(tts_request)
        db.commit()
        db.refresh(tts_request)
        
        # Convert audio to base64 for response
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        audio_url = f"data:audio/wav;base64,{audio_base64}"
        
        # Update request with audio URL
        tts_request.audio_url = audio_url
        db.commit()
        
        return CartesiaGenerateResponse(
            request_id=tts_request.id,
            audio_url=audio_url,
            text=request_body.text,
            voice_id=request_body.voice_id,
            created_at=tts_request.created_at
        )
    except ConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate audio: {str(e)}"
        )


@router.get("/voices")
async def get_cartesia_voices(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get list of available Cartesia voices."""
    # Authenticate user using request-based dependency
    user = get_current_user_from_request(request, db)
    
    try:
        voices = get_available_voices()
        # Always return at least default voices
        if not voices or len(voices) == 0:
            # Fallback default voice
            voices = [{
                "voice_id": "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
                "name": "Default Voice",
                "description": "High-quality default voice",
            }]
        return {"voices": voices}
    except ConfigurationError as e:
        # Even on config error, return default voices so user can still use TTS
        logger.warning(f"Configuration error but returning default voices: {str(e)}")
        return {
            "voices": [{
                "voice_id": "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
                "name": "Default Voice",
                "description": "High-quality default voice",
            }]
        }
    except Exception as e:
        # On any error, return default voices
        logger.warning(f"Error fetching voices but returning defaults: {str(e)}")
        return {
            "voices": [{
                "voice_id": "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
                "name": "Default Voice",
                "description": "High-quality default voice",
            }]
        }


@router.get("/models")
async def get_cartesia_models(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get list of available Cartesia models."""
    # Authenticate user using request-based dependency
    user = get_current_user_from_request(request, db)
    
    return {"models": get_available_models()}


@router.get("/languages")
async def get_cartesia_languages(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get list of available languages."""
    # Authenticate user using request-based dependency
    user = get_current_user_from_request(request, db)
    
    return {"languages": get_available_languages()}

