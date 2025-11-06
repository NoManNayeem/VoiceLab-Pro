/**
 * API client for backend communication
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Get authentication token from localStorage
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Set authentication token in localStorage
   */
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Remove authentication token from localStorage
   */
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login
   */
  async login(username, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore errors on logout
    } finally {
      this.removeToken();
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  /**
   * Generate TTS audio
   */
  async generateTTS(text, voiceId = null, options = {}) {
    return this.request('/api/tts/generate', {
      method: 'POST',
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
  }

  /**
   * Get TTS history
   */
  async getTTSHistory(limit = 10, offset = 0) {
    return this.request(`/api/tts/history?limit=${limit}&offset=${offset}`);
  }

  /**
   * Get available voices
   */
  async getVoices() {
    return this.request('/api/tts/voices');
  }

  /**
   * Test ElevenLabs API key status
   */
  async testElevenLabs() {
    return this.request('/api/elevenlabs/test');
  }
}

export const apiClient = new ApiClient();

