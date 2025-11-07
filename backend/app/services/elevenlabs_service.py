"""ElevenLabs TTS service integration."""
from elevenlabs.client import ElevenLabs
from elevenlabs import VoiceSettings
from app.config import get_settings, ConfigurationError
from typing import Optional
import time
import logging

logger = logging.getLogger(__name__)

settings = get_settings()

# Initialize ElevenLabs client (lazy initialization to avoid import-time issues)
elevenlabs_client = None

def get_elevenlabs_client():
    """Get or initialize ElevenLabs client."""
    global elevenlabs_client
    if elevenlabs_client is None:
        if settings.elevenlabs_api_key:
            elevenlabs_client = ElevenLabs(api_key=settings.elevenlabs_api_key)
            logger.info("ElevenLabs client initialized successfully")
        else:
            logger.warning("ElevenLabs API key not set. TTS functionality will not work.")
    return elevenlabs_client


def generate_tts_audio(
    text: str, 
    voice_id: Optional[str] = None, 
    max_retries: int = 3,
    stability: Optional[float] = None,
    similarity_boost: Optional[float] = None,
    style: Optional[float] = None,
    use_speaker_boost: Optional[bool] = None,
    model_id: Optional[str] = None,
    language: Optional[str] = None
) -> bytes:
    """
    Generate TTS audio using ElevenLabs API with retry logic.
    
    Supports ElevenLabs v3 Audio Tags for enhanced control:
    - Use square brackets [] for emotional and vocal control: [excited], [whispers], [laughs]
    - Place tags before text: [whispers] Hello there
    - Or after for reactions: That was amazing [laughs]
    - Use CAPITALIZATION for emphasis: "That was AMAZING!"
    - Use ellipses (...) for pauses: "It was... difficult"
    - Minimum 250 characters recommended for consistency
    
    Reference: https://elevenlabs.io/docs/product-guides/playground/text-to-speech
    
    Args:
        text: Text to convert to speech (supports Audio Tags for v3 model)
        voice_id: Optional voice ID (uses default if not provided)
        max_retries: Maximum number of retry attempts
        stability: Voice stability (0.0-1.0). Lower = more emotional, Higher = more stable. Default: 0.5
        similarity_boost: How closely to match the original voice (0.0-1.0). Default: 0.75
        style: Style exaggeration (0.0-1.0). Default: 0.0 (recommended to keep at 0)
        use_speaker_boost: Boost similarity to original speaker. Default: True
        model_id: Model to use (eleven_v3, eleven_multilingual_v2, eleven_monolingual_v1, eleven_flash_v2_5, eleven_turbo_v2_5, eleven_turbo_v2). Default: eleven_v3
        language: Language code (e.g., 'en', 'es', 'fr'). Optional, model will auto-detect if not provided. Note: Passed as 'language_code' to API
    
    Returns:
        Audio bytes
    
    Raises:
        ConfigurationError: If API key is not set
        Exception: If generation fails after retries
    """
    client = get_elevenlabs_client()
    if not settings.elevenlabs_api_key or client is None:
        raise ConfigurationError(
            "ELEVENLABS_API_KEY is not set. Please set it in your .env file. "
            "Get your API key from https://elevenlabs.io/"
        )
    
    if not text or len(text.strip()) == 0:
        raise ValueError("Text cannot be empty")
    
    # Configure voice settings with defaults based on ElevenLabs best practices
    # Reference: https://elevenlabs.io/docs/product-guides/playground/text-to-speech
    # Default: stability=0.5, similarity=0.75, style=0.0, speaker_boost=True
    voice_settings = VoiceSettings(
        stability=stability if stability is not None else 0.5,
        similarity_boost=similarity_boost if similarity_boost is not None else 0.75,
        style=style if style is not None else 0.0,
        use_speaker_boost=use_speaker_boost if use_speaker_boost is not None else True
    )
    
    last_error = None
    for attempt in range(max_retries):
        try:
            logger.info(f"Generating TTS audio (attempt {attempt + 1}/{max_retries})")
            
            # Generate audio using the latest ElevenLabs API
            # Reference: https://elevenlabs.io/docs/quickstart
            # The convert() method returns a generator that yields audio chunks
            
            # Determine model_id - use provided or default to v3 (most expressive)
            # Note: v3 is alpha and may have higher latency, but offers best quality
            selected_model = model_id or "eleven_v3"
            
            # Get voice_id (use default if not provided)
            selected_voice_id = voice_id or "JBFqnCBsd6RMkjVDRZzb"  # Default voice from docs
            
            # Build convert parameters according to ElevenLabs SDK v3 signature:
            # convert(voice_id: str, *, text: str, model_id: Optional[str], 
            #         voice_settings: Optional[VoiceSettings], output_format: Optional[str],
            #         language_code: Optional[str], ...)
            convert_params = {
                "text": text,
                "model_id": selected_model,
                "output_format": "mp3_44100_128",
                "voice_settings": voice_settings
            }
            
            # Add language_code if provided (note: parameter is language_code, not language)
            if language:
                convert_params["language_code"] = language
            
            # Call convert with voice_id as positional argument (first parameter)
            audio_generator = client.text_to_speech.convert(selected_voice_id, **convert_params)
            
            # Collect all audio chunks from the generator into bytes
            audio = b"".join(audio_generator)
            
            logger.info("TTS audio generated successfully")
            return audio
            
        except Exception as e:
            last_error = e
            error_msg = str(e)
            
            # Handle abuse detection specifically - don't retry
            if "detected_unusual_activity" in error_msg.lower():
                raise ConfigurationError(
                    "ElevenLabs Free Tier disabled due to unusual activity detected.\n\n"
                    "Quick fixes:\n"
                    "• Disable VPN/Proxy (Free Tier doesn't work with VPNs)\n"
                    "• Upgrade to Paid Plan ($5/month) - removes restrictions\n"
                    "• Contact support: https://elevenlabs.io/help\n\n"
                    "Common causes: VPN/Proxy usage, multiple free accounts, or rate limiting."
                )
            
            # Don't retry on certain errors
            if "401" in error_msg or "unauthorized" in error_msg.lower():
                # Try to extract more details from the exception
                error_details = error_msg
                if hasattr(e, 'response'):
                    try:
                        if hasattr(e.response, 'text'):
                            import json
                            try:
                                error_data = json.loads(e.response.text)
                                if 'detail' in error_data:
                                    error_details = str(error_data['detail'])
                                elif isinstance(error_data, dict):
                                    error_details = str(error_data)
                            except:
                                error_details = e.response.text
                        elif hasattr(e.response, 'json'):
                            error_data = e.response.json()
                            if 'detail' in error_data:
                                error_details = str(error_data['detail'])
                    except:
                        pass
                
                # Check for other unusual activity indicators
                if "unusual" in error_details.lower() or "abuse" in error_details.lower() or "free tier" in error_details.lower() or "temporarily unavailable" in error_details.lower() or "service" in error_details.lower():
                    raise ConfigurationError(
                        "ElevenLabs service temporarily unavailable.\n\n"
                        "This may be due to:\n"
                        "1. Using a VPN/Proxy (Free Tier doesn't work with VPNs)\n"
                        "2. Multiple free accounts from the same IP\n"
                        "3. Rate limiting or abuse detection\n"
                        "4. Service maintenance or temporary outage\n\n"
                        "Solutions:\n"
                        "• Disable VPN/Proxy if using one\n"
                        "• Wait a few minutes and try again\n"
                        "• Consider upgrading to a Paid Plan\n"
                        "• Contact ElevenLabs support: https://elevenlabs.io/help"
                    )
                else:
                    raise ConfigurationError(
                        f"ElevenLabs service temporarily unavailable.\n\n"
                        f"Please check your ELEVENLABS_API_KEY in .env file.\n"
                        f"Get your API key from https://elevenlabs.io/\n\n"
                        f"If this persists, the service may be temporarily unavailable or your API key may need verification."
                    )
            
            if "429" in error_msg or "rate limit" in error_msg.lower():
                wait_time = (attempt + 1) * 2
                logger.warning(
                    f"Rate limit hit. Waiting {wait_time} seconds before retry..."
                )
                time.sleep(wait_time)
                continue
            
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 1
                logger.warning(
                    f"TTS generation failed (attempt {attempt + 1}/{max_retries}). "
                    f"Retrying in {wait_time} seconds... Error: {error_msg}"
                )
                time.sleep(wait_time)
            else:
                logger.error(f"TTS generation failed after {max_retries} attempts")
                raise Exception(
                    f"Failed to generate TTS audio after {max_retries} attempts: {error_msg}"
                )
    
    # Should not reach here, but just in case
    raise Exception(f"Failed to generate TTS audio: {str(last_error)}")


def get_available_voices():
    """
    Get list of available voices from ElevenLabs API.
    
    ElevenLabs supports 32 languages across multilingual v2 and Flash v2.5 models.
    Voice types include:
    - Default/Library Voices: Pre-designed, high-quality voices (e.g., George, Adam, Alexandra)
    - Community Voices: 5,000+ voices shared by the community
    - Cloned Voices: Instant or Professional voice clones
    - Voice Design: AI-generated voices from text descriptions
    
    Popular default voices:
    - kdmDKE6EkgrWrrykO9Qt - Alexandra: Super realistic, young female
    - L0Dsvb3SLTyegXwtm47J - Archer: Grounded, friendly young British male
    - JBFqnCBsd6RMkjVDRZzb - George: Commonly referenced default
    - pNInz6obpgDQGcFmaJgB - Adam: Commonly referenced default
    
    Pro tip: Choose voices with accents matching your target language/region for 
    most natural results. All voices support 32 languages, but accent fidelity 
    varies based on the voice's characteristics.
    
    Returns:
        List of voice objects with id, name, category, description, and preview_url
    
    Raises:
        ConfigurationError: If API key is not set
        Exception: If fetching voices fails
    """
    client = get_elevenlabs_client()
    
    if not settings.elevenlabs_api_key or client is None:
        raise ConfigurationError(
            "ELEVENLABS_API_KEY is not set. Please set it in your .env file. "
            "Get your API key from https://elevenlabs.io/"
        )
    
    try:
        logger.info("Fetching available voices from ElevenLabs")
        voices = client.voices.get_all()
        
        # Convert to list of dicts for JSON serialization
        voice_list = []
        for voice in voices.voices:
            voice_data = {
                "voice_id": voice.voice_id,
                "name": voice.name,
                "category": getattr(voice, 'category', 'premade'),
                "description": getattr(voice, 'description', ''),
                "preview_url": getattr(voice, 'preview_url', None),
            }
            
            # Add additional metadata if available
            if hasattr(voice, 'labels'):
                voice_data["labels"] = voice.labels
            if hasattr(voice, 'settings'):
                voice_data["settings"] = {
                    "stability": getattr(voice.settings, 'stability', None),
                    "similarity_boost": getattr(voice.settings, 'similarity_boost', None),
                }
            
            voice_list.append(voice_data)
        
        # Sort voices: default/premade first, then by name
        voice_list.sort(key=lambda v: (
            0 if v.get('category') in ['premade', 'default'] else 1,
            v['name'].lower()
        ))
        
        logger.info(f"Retrieved {len(voice_list)} voices")
        return voice_list
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to fetch voices: {error_msg}")
        
        # Handle abuse detection specifically
        if "detected_unusual_activity" in error_msg.lower():
            raise ConfigurationError(
                "ElevenLabs Free Tier disabled due to unusual activity detected.\n\n"
                "Quick fixes:\n"
                "• Disable VPN/Proxy (Free Tier doesn't work with VPNs)\n"
                "• Upgrade to Paid Plan ($5/month) - removes restrictions\n"
                "• Contact support: https://elevenlabs.io/help\n\n"
                "Common causes: VPN/Proxy usage, multiple free accounts, or rate limiting."
            )
        
        if "401" in error_msg or "unauthorized" in error_msg.lower():
            if "unusual" in error_msg.lower() or "abuse" in error_msg.lower() or "free tier" in error_msg.lower():
                raise ConfigurationError(
                    "ElevenLabs API: Unusual activity detected. Free Tier usage may be disabled.\n"
                    "This can happen if using VPN/Proxy or due to abuse detection.\n"
                    "Consider upgrading to a Paid Plan or contact ElevenLabs support."
                )
            else:
                raise ConfigurationError(
                    f"Invalid ElevenLabs API key. Please check your ELEVENLABS_API_KEY in .env file. "
                    f"Get your API key from https://elevenlabs.io/\n"
                    f"Error: {error_msg}"
                )
        
        raise Exception(f"Failed to fetch voices: {error_msg}")

