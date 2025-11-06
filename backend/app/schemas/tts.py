"""TTS schemas."""
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional


class TTSGenerateRequest(BaseModel):
    """TTS generation request schema."""
    text: str
    voice_id: Optional[str] = None
    stability: Optional[float] = None
    similarity_boost: Optional[float] = None
    style: Optional[float] = None
    use_speaker_boost: Optional[bool] = None
    model_id: Optional[str] = None
    language: Optional[str] = None
    is_multi_speaker: Optional[bool] = False


class TTSGenerateResponse(BaseModel):
    """TTS generation response schema."""
    request_id: UUID
    audio_url: str
    text: str
    voice_id: Optional[str] = None
    created_at: datetime


class TTSHistoryItem(BaseModel):
    """TTS history item schema."""
    id: UUID
    text: str
    voice_id: Optional[str] = None
    audio_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TTSHistoryResponse(BaseModel):
    """TTS history response schema."""
    requests: list[TTSHistoryItem]
    total: int

