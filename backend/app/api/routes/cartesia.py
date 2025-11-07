"""Cartesia AI TTS routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
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
    request: CartesiaGenerateRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Generate TTS audio using Cartesia AI."""
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
        # Generate audio using Cartesia
        audio_bytes = generate_tts_audio(
            text=request.text,
            voice_id=request.voice_id,
            model_id=request.model_id,
            language=request.language,
            speed=request.speed,
            volume=request.volume,
            emotion=request.emotion,
        )
        
        # Store request in database (reuse TTSRequest model)
        from app.models.tts_request import TTSRequest
        tts_request = TTSRequest(
            user_id=user.id,
            text=request.text,
            voice_id=request.voice_id or "cartesia-default",
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
            text=request.text,
            voice_id=request.voice_id,
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
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get list of available Cartesia voices."""
    # Authenticate user
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    user = get_current_user(token=token, db=db)
    
    try:
        voices = get_available_voices()
        return {"voices": voices}
    except ConfigurationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch voices: {str(e)}"
        )


@router.get("/models")
async def get_cartesia_models(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get list of available Cartesia models."""
    # Authenticate user
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    user = get_current_user(token=token, db=db)
    
    return {"models": get_available_models()}


@router.get("/languages")
async def get_cartesia_languages(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get list of available languages."""
    # Authenticate user
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    user = get_current_user(token=token, db=db)
    
    return {"languages": get_available_languages()}

