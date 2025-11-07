/**
 * API client for backend communication
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Make API request with cookie-based authentication
   * Cookies are automatically sent by the browser
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
      credentials: 'include', // Include cookies in cross-origin requests
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate TTS audio
   * Uses Next.js API route proxy to handle authentication
   */
  async generateTTS(text, voiceId = null, options = {}) {
    // Use Next.js API route proxy (which handles cookies server-side)
    const response = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        text, 
        voice_id: voiceId,
        model_id: options.modelId,
        language: options.language,
        is_multi_speaker: options.isMultiSpeaker || false,
        stability: options.stability,
        similarity_boost: options.similarityBoost,
        style: options.style,
        use_speaker_boost: options.useSpeakerBoost
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      // Preserve the detailed error message from backend
      const errorMsg = data.error || data.detail || 'Failed to generate audio';
      throw new Error(errorMsg);
    }
    
    return response.json();
  }

  /**
   * Get TTS history
   */
  async getTTSHistory(limit = 10, offset = 0) {
    return this.request(`/api/tts/history?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get available voices
   * Uses Next.js API route proxy to handle authentication
   */
  async getVoices() {
    // Use Next.js API route proxy (which handles cookies server-side)
    const response = await fetch('/api/tts/voices', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.detail || 'Failed to get voices');
    }
    
    return response.json();
  }

  /**
   * Test ElevenLabs API key status
   */
  async testElevenLabs() {
    return this.request('/api/elevenlabs/test');
  }

  /**
   * Generate Cartesia TTS audio
   * Uses Next.js API route proxy to handle authentication
   */
  async generateCartesiaTTS(text, options = {}) {
    // Use Next.js API route proxy (which handles cookies server-side)
    const response = await fetch('/api/cartesia/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        text,
        voice_id: options.voiceId,
        model_id: options.modelId || 'sonic-3',
        language: options.language,
        speed: options.speed || 1.0,
        volume: options.volume || 1.0,
        emotion: options.emotion || 'neutral',
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.detail || 'Failed to generate audio');
    }
    
    return response.json();
  }

  /**
   * Get available Cartesia voices
   * Uses Next.js API route proxy to handle authentication
   */
  async getCartesiaVoices() {
    // Use Next.js API route proxy (which handles cookies server-side)
    const response = await fetch('/api/cartesia/voices', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.detail || 'Failed to get voices');
    }
    
    return response.json();
  }

  /**
   * Get available Cartesia models
   * Uses Next.js API route proxy to handle authentication
   */
  async getCartesiaModels() {
    // Use Next.js API route proxy (which handles cookies server-side)
    const response = await fetch('/api/cartesia/models', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.detail || 'Failed to get models');
    }
    
    return response.json();
  }

  /**
   * Get available languages
   * Uses Next.js API route proxy to handle authentication
   */
  async getCartesiaLanguages() {
    // Use Next.js API route proxy (which handles cookies server-side)
    const response = await fetch('/api/cartesia/languages', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.detail || 'Failed to get languages');
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();

