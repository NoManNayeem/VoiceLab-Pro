"""Cartesia AI TTS service integration."""
from cartesia import Cartesia
from app.config import get_settings, ConfigurationError
from typing import Optional, List, Dict
import logging

logger = logging.getLogger(__name__)

settings = get_settings()

# Initialize Cartesia client (lazy initialization)
cartesia_client = None

def get_cartesia_client():
    """Get or initialize Cartesia client."""
    global cartesia_client
    if cartesia_client is None:
        if settings.cartesia_api_key:
            cartesia_client = Cartesia(api_key=settings.cartesia_api_key)
            logger.info("Cartesia client initialized successfully")
        else:
            logger.warning("Cartesia API key not set. TTS functionality will not work.")
    return cartesia_client

# Cartesia API configuration
CARTESIA_VERSION = "2025-04-16"
CARTESIA_API_BASE = "https://api.cartesia.ai"  # For voices endpoint (not in SDK yet)

# Available models
CARTESIA_MODELS = [
    {"id": "sonic-3", "name": "Sonic 3", "description": "World's fastest, most emotive, ultra-realistic TTS (90ms latency)"},
    {"id": "sonic-turbo", "name": "Sonic Turbo", "description": "Ultra-fast performance (40ms latency)"},
    {"id": "sonic-multilingual", "name": "Sonic Multilingual", "description": "Multilingual support"},
]

# Available languages
CARTESIA_LANGUAGES = [
    {"code": "en", "name": "English"},
    {"code": "fr", "name": "French"},
    {"code": "de", "name": "German"},
    {"code": "es", "name": "Spanish"},
    {"code": "pt", "name": "Portuguese"},
    {"code": "zh", "name": "Chinese"},
    {"code": "ja", "name": "Japanese"},
    {"code": "hi", "name": "Hindi"},
    {"code": "it", "name": "Italian"},
    {"code": "ko", "name": "Korean"},
    {"code": "nl", "name": "Dutch"},
    {"code": "pl", "name": "Polish"},
    {"code": "ru", "name": "Russian"},
    {"code": "sv", "name": "Swedish"},
    {"code": "tr", "name": "Turkish"},
    {"code": "ar", "name": "Arabic"},
]




def generate_tts_audio(
    text: str,
    voice_id: Optional[str] = None,
    model_id: str = "sonic-3",
    language: Optional[str] = None,
    speed: float = 1.0,
    volume: float = 1.0,
    emotion: str = "neutral",
    output_format: Optional[Dict] = None,
    max_retries: int = 3,
) -> bytes:
    """
    Generate TTS audio using Cartesia AI API.
    
    Args:
        text: Text to convert to speech
        voice_id: Voice ID (defaults to a popular voice if not provided)
        model_id: Model to use (sonic-3, sonic-turbo, etc.)
        language: Language code (e.g., 'en', 'es', 'fr')
        speed: Speech speed (0.5-2.0, default: 1.0)
        volume: Speech volume (0.0-2.0, default: 1.0)
        emotion: Emotion for sonic-3 (neutral, happy, sad, angry, etc.)
        output_format: Custom output format dict
        max_retries: Maximum number of retry attempts
    
    Returns:
        Audio bytes (WAV format by default)
    
    Raises:
        ConfigurationError: If API key is not set
        Exception: If generation fails after retries
    """
    if not settings.cartesia_api_key:
        raise ConfigurationError(
            "CARTESIA_API_KEY is not set. Please set it in your .env file. "
            "Get your API key from https://play.cartesia.ai/keys"
        )
    
    if not text or len(text.strip()) == 0:
        raise ValueError("Text cannot be empty")
    
    client = get_cartesia_client()
    if not settings.cartesia_api_key or client is None:
        raise ConfigurationError(
            "CARTESIA_API_KEY is not set. Please set it in your .env file. "
            "Get your API key from https://play.cartesia.ai/keys"
        )
    
    # Default voice ID (popular voice from Cartesia)
    default_voice_id = voice_id or "6ccbfb76-1fc6-48f7-b71d-91ac6298247b"
    
    # Default output format (WAV, PCM, 44.1kHz)
    if output_format is None:
        output_format = {
            "container": "wav",
            "encoding": "pcm_f32le",
            "sample_rate": 44100,
        }
    
    last_error = None
    for attempt in range(max_retries):
        try:
            logger.info(f"Generating Cartesia TTS audio (attempt {attempt + 1}/{max_retries})")
            
            # Use official Cartesia SDK - client.tts.bytes() returns a chunk iterator
            # Reference: https://docs.cartesia.ai/use-an-sdk/python
            # Build parameters dict - only include language if provided
            tts_params = {
                "model_id": model_id,
                "transcript": text,
                "voice": {
                    "mode": "id",
                    "id": default_voice_id,
                },
                "output_format": output_format,
                "generation_config": {
                    "speed": speed,
                    "volume": volume,
                    "emotion": emotion,
                },
            }
            
            # Only add language if provided (optional parameter)
            if language:
                tts_params["language"] = language
            
            chunk_iter = client.tts.bytes(**tts_params)
            
            # Collect all chunks from the iterator into bytes
            audio = b"".join(chunk_iter)
            
            logger.info("Cartesia TTS audio generated successfully")
            return audio
            
        except Exception as e:
            last_error = e
            error_msg = str(e)
            
            # Handle specific errors
            if "401" in error_msg or "unauthorized" in error_msg.lower():
                raise ConfigurationError(
                    f"Invalid Cartesia API key. Please check your CARTESIA_API_KEY in .env file. "
                    f"Get your API key from https://play.cartesia.ai/keys\n"
                    f"Error: {error_msg}"
                )
            
            if "429" in error_msg or "rate limit" in error_msg.lower():
                wait_time = (attempt + 1) * 2
                logger.warning(f"Rate limit hit. Waiting {wait_time} seconds before retry...")
                import time
                time.sleep(wait_time)
                continue
            
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 1
                logger.warning(
                    f"Cartesia TTS generation failed (attempt {attempt + 1}/{max_retries}). "
                    f"Retrying in {wait_time} seconds... Error: {error_msg}"
                )
                import time
                time.sleep(wait_time)
            else:
                logger.error(f"Cartesia TTS generation failed after {max_retries} attempts")
                raise Exception(
                    f"Failed to generate Cartesia TTS audio after {max_retries} attempts: {error_msg}"
                )
    
    raise Exception(f"Failed to generate Cartesia TTS audio: {str(last_error)}")


def get_available_voices() -> List[Dict]:
    """
    Get list of available voices from Cartesia API.
    Returns default voices if API call fails or returns empty.
    
    Returns:
        List of voice objects with id, name, and metadata
    """
    # Default voices to use if API call fails or returns empty
    DEFAULT_VOICES = [
        {
            "voice_id": "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
            "name": "Default Voice",
            "description": "High-quality default voice",
        }
    ]
    
    client = get_cartesia_client()
    if not settings.cartesia_api_key or client is None:
        logger.warning("Cartesia API key not set. Returning default voices.")
        return DEFAULT_VOICES
    
    try:
        logger.info("Fetching available voices from Cartesia")
        
        # Use official Cartesia SDK to fetch voices
        # Note: The SDK may have a voices.list() method, but if not, we'll use the API directly
        # For now, we'll use requests as a fallback since the SDK might not expose voices endpoint
        import requests
        
        headers = {
            "Cartesia-Version": CARTESIA_VERSION,
            "X-API-Key": settings.cartesia_api_key,
            "Content-Type": "application/json",
        }
        url = "https://api.cartesia.ai/voices"
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            error_msg = response.text
            logger.warning(f"Cartesia API returned status {response.status_code}: {error_msg}")
            if response.status_code == 401:
                logger.warning("Invalid Cartesia API key. Returning default voices.")
                return DEFAULT_VOICES
            # For other errors, return default voices instead of raising
            logger.warning("Returning default voices due to API error")
            return DEFAULT_VOICES
        
        data = response.json()
        voices = data.get("voices", [])
        
        # If API returns empty list, use default voices
        if not voices or len(voices) == 0:
            logger.warning("Cartesia API returned 0 voices. Using default voices.")
            return DEFAULT_VOICES
        
        # Format voice data
        voice_list = []
        for voice in voices:
            voice_data = {
                "voice_id": voice.get("id"),
                "name": voice.get("name", "Unknown"),
                "description": voice.get("description", ""),
                "preview_url": voice.get("preview_url"),
            }
            voice_list.append(voice_data)
        
        # Sort by name
        voice_list.sort(key=lambda v: v["name"].lower())
        
        logger.info(f"Retrieved {len(voice_list)} voices from Cartesia")
        return voice_list
        
    except Exception as e:
        logger.warning(f"Failed to fetch Cartesia voices: {str(e)}. Returning default voices.")
        return DEFAULT_VOICES


def get_available_models() -> List[Dict]:
    """Get list of available Cartesia models."""
    return CARTESIA_MODELS


def get_available_languages() -> List[Dict]:
    """Get list of available languages."""
    return CARTESIA_LANGUAGES

