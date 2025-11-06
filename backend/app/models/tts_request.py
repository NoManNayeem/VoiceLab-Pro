"""TTS Request model."""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class TTSRequest(Base):
    """TTS Request model for storing text-to-speech generation requests."""
    __tablename__ = "tts_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    voice_id = Column(String(100), nullable=True)
    audio_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationship
    user = relationship("User", backref="tts_requests")
    
    def __repr__(self):
        return f"<TTSRequest(id={self.id}, user_id={self.user_id})>"

