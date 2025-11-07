'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthProvider';
import { apiClient } from '../../../lib/api';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { useToast } from '../../../components/Toast';
import { 
  FiPlay, 
  FiDownload, 
  FiLoader, 
  FiType, 
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiVolume2,
  FiTrendingUp
} from 'react-icons/fi';
import AnimatedSpeaker from '../../../components/AnimatedSpeaker';
import Link from 'next/link';

// Sample texts for quick testing
const SAMPLE_TEXTS = [
  {
    label: 'Short',
    icon: '⚡',
    text: 'Hello, this is a quick test of Cartesia AI text-to-speech.'
  },
  {
    label: 'Medium',
    icon: '📝',
    text: 'Welcome to Cartesia AI! This is an ultra-fast text-to-speech platform with 90ms latency. Perfect for real-time applications and conversational AI experiences.'
  },
  {
    label: 'Long',
    icon: '📚',
    text: 'Cartesia AI provides state-of-the-art text-to-speech technology with ultra-low latency. The Sonic 3 model can stream out the first byte of audio in just 90ms, making it perfect for real-time voice applications, AI avatars, dubbing, and narration. With support for 40+ languages and advanced emotion control, Cartesia delivers natural, expressive speech that feels truly human.'
  },
  {
    label: 'Story',
    icon: '📖',
    text: 'Once upon a time, in a world where speed and quality merged, there was Cartesia AI. It transformed real-time communication, making every conversation feel natural and instant. The future of voice AI was here, streaming at 90 milliseconds.'
  },
  {
    label: 'Technical',
    icon: '💻',
    text: 'Cartesia Sonic 3 is the world\'s fastest, most emotive, ultra-realistic text-to-speech model. It streams the first byte of audio in just 90ms, which is about twice as fast as the blink of an eye. For even better performance, Sonic Turbo offers 40ms latency, perfect for the most demanding real-time applications.'
  }
];

// Available models
const MODELS = [
  { id: 'sonic-3', name: 'Sonic 3', description: 'World\'s fastest, most emotive (90ms latency)' },
  { id: 'sonic-turbo', name: 'Sonic Turbo', description: 'Ultra-fast performance (40ms latency)' },
  { id: 'sonic-multilingual', name: 'Sonic Multilingual', description: 'Multilingual support' },
];

// Available languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'it', name: 'Italian' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ar', name: 'Arabic' },
];

// Emotions for Sonic 3
const EMOTIONS = [
  { id: 'neutral', name: 'Neutral' },
  { id: 'happy', name: 'Happy' },
  { id: 'sad', name: 'Sad' },
  { id: 'angry', name: 'Angry' },
  { id: 'excited', name: 'Excited' },
  { id: 'calm', name: 'Calm' },
];

function CartesiaTTSPageContent() {
  const router = useRouter();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [audio, setAudio] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedModel, setSelectedModel] = useState('sonic-3');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);

  useEffect(() => {
    // Only load voices when authenticated
    if (isAuthenticated) {
      loadVoices();
    }
  }, [isAuthenticated]);

  const loadVoices = async () => {
    setLoadingVoices(true);
    try {
      const response = await apiClient.getCartesiaVoices();
      if (response.voices && response.voices.length > 0) {
        setVoices(response.voices);
        setSelectedVoice(response.voices[0].voice_id);
      } else {
        // Use default voice if API returns empty
        const defaultVoice = {
          voice_id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
          name: "Default Voice",
          description: "High-quality default voice"
        };
        setVoices([defaultVoice]);
        setSelectedVoice(defaultVoice.voice_id);
        toast.info('Using default voice. Cartesia API may not have returned voices.');
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
      // Set default voice on error
      const defaultVoice = {
        voice_id: "6ccbfb76-1fc6-48f7-b71d-91ac6298247b",
        name: "Default Voice",
        description: "High-quality default voice"
      };
      setVoices([defaultVoice]);
      setSelectedVoice(defaultVoice.voice_id);
      toast.warning('Using default voice. Could not load voices from API.');
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleSampleText = (sampleText) => {
    setText(sampleText);
    setError('');
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      const msg = 'Please enter some text to convert to speech';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (text.length > 5000) {
      const msg = 'Text is too long. Please keep it under 5000 characters.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setAudioUrl(null);
    if (audio) {
      audio.pause();
      audio.src = '';
    }

    try {
      const response = await apiClient.generateCartesiaTTS(text, {
        voiceId: selectedVoice,
        modelId: selectedModel,
        language: selectedLanguage,
        speed: speed,
        volume: volume,
        emotion: selectedEmotion,
      });

      if (response.audio_url) {
        setAudioUrl(response.audio_url);
        const newAudio = new Audio(response.audio_url);
        setAudio(newAudio);
        setSuccess(true);
        toast.success('Audio generated successfully!');
        // Auto-scroll to audio player
        setTimeout(() => {
          document.getElementById('audio-player')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate audio';
      // Make error messages more user-friendly
      let userFriendlyMsg = errorMsg;
      if (errorMsg.includes('API key')) {
        userFriendlyMsg = 'API configuration error. Please contact support.';
      } else if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
        userFriendlyMsg = 'Too many requests. Please wait a moment and try again.';
      }
      setError(userFriendlyMsg);
      toast.error(userFriendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (audio) {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'cartesia-tts.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-accent-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent mb-2">
                Cartesia AI TTS
              </h1>
              <p className="text-gray-600">Ultra-fast text-to-speech with 90ms latency</p>
            </div>
            <Link
              href="/providers"
              className="text-sm text-gray-600 hover:text-accent-600 transition-colors"
            >
              ← Back to providers
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded-lg animate-fade-in flex items-center gap-2">
            <span className="text-lg">✓</span>
            <p className="text-sm font-medium">Audio generated successfully! Scroll down to play or download.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in flex items-start gap-2">
            <span className="text-lg mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-medium">{error}</p>
              {error.includes('API') && (
                <p className="text-xs mt-1 text-red-600">If this persists, the service may be temporarily unavailable.</p>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  <FiType className="inline w-4 h-4 mr-2" />
                  Enter Text
                </label>
                <span className="text-xs text-gray-500">
                  {text.length} / 5000 characters
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError('');
                  setSuccess(false);
                }}
                placeholder="Type or paste your text here... For example: 'Hello, welcome to Cartesia AI text-to-speech!'"
                maxLength={5000}
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all bg-white text-gray-900 placeholder-gray-400 resize-none"
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  💡 Tip: Try one of the sample texts below to get started quickly
                </p>
                {text.length > 0 && (
                  <button
                    onClick={() => {
                      setText('');
                      setError('');
                      setSuccess(false);
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {SAMPLE_TEXTS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSampleText(sample.text)}
                    className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-accent-100 text-gray-700 hover:text-accent-700 rounded-lg transition-colors"
                  >
                    {sample.icon} {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-soft p-6 animate-slide-up">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    <FiTrendingUp className="inline w-4 h-4 mr-2" />
                    Voice Settings {!showSettings && <span className="text-xs font-normal text-gray-500">(Optional)</span>}
                  </label>
                  {!showSettings && (
                    <p className="text-xs text-gray-500 mt-1">Customize voice, language, speed, and emotion</p>
                  )}
                </div>
                {showSettings ? (
                  <FiChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <FiChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showSettings && (
                <div className="mt-4 space-y-4 animate-fade-in">
                  {/* Model Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white text-gray-900"
                    >
                      {MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voice Selection */}
                  {loadingVoices ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Voice
                      </label>
                      <div className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ) : voices.length > 0 ? (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Voice
                      </label>
                      <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white text-gray-900"
                        aria-label="Select voice"
                      >
                        {voices.map((voice) => (
                          <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-xs">No voices available. Using default voice.</p>
                    </div>
                  )}

                  {/* Language Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white text-gray-900"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Emotion (Sonic 3 only) */}
                  {selectedModel === 'sonic-3' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Emotion
                      </label>
                      <select
                        value={selectedEmotion}
                        onChange={(e) => setSelectedEmotion(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white text-gray-900"
                      >
                        {EMOTIONS.map((emotion) => (
                          <option key={emotion.id} value={emotion.id}>
                            {emotion.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Speed */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Speed: {speed.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={speed}
                      onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  {/* Volume */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Volume: {volume.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.0"
                      max="2.0"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !text.trim()}
              className="w-full bg-gradient-to-r from-accent-600 to-accent-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-accent-700 hover:to-accent-800 focus:outline-none focus:ring-4 focus:ring-accent-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/50 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <AnimatedSpeaker />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FiVolume2 className="w-5 h-5" />
                  <span>Generate Speech</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column - Audio Player */}
          <div className="lg:col-span-1">
            <div id="audio-player" className="bg-white rounded-2xl shadow-soft p-6 animate-slide-up sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio Player</h3>
              
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <AnimatedSpeaker />
                  <p className="mt-4 text-sm text-gray-600">Generating audio...</p>
                </div>
              )}

              {!loading && !audioUrl && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiVolume2 className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">Your audio will appear here</p>
                  <p className="text-xs text-gray-500">Enter text above and click "Generate Speech"</p>
                </div>
              )}

              {!loading && audioUrl && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-800 font-medium">✓ Audio ready!</p>
                  </div>
                  <audio
                    ref={(el) => {
                      if (el) setAudio(el);
                    }}
                    src={audioUrl}
                    controls
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handlePlay}
                      className="flex-1 bg-accent-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-accent-700 transition-colors flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <FiPlay className="w-4 h-4" />
                      <span>Play Audio</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Click play to hear your generated speech
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartesiaTTSPage() {
  return (
    <ProtectedRoute>
      <CartesiaTTSPageContent />
    </ProtectedRoute>
  );
}

