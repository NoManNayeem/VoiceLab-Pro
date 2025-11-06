'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { apiClient } from '../../lib/api';
import { 
  FiPlay, 
  FiDownload, 
  FiLoader, 
  FiType, 
  FiX, 
  FiChevronRight,
  FiChevronLeft,
  FiVolume2,
  FiSettings,
  FiZap,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';
import AnimatedSpeaker from '../../components/AnimatedSpeaker';

// Sample texts for quick testing
const SAMPLE_TEXTS = [
  {
    label: 'Short',
    icon: '⚡',
    text: 'Hello, this is a quick test of the text-to-speech system.'
  },
  {
    label: 'Medium',
    icon: '📝',
    text: 'Welcome to VoiceLab Pro! This is a powerful text-to-speech platform that converts your written words into natural, human-like speech. Try it out with any text you want.'
  },
  {
    label: 'Long',
    icon: '📚',
    text: 'Text-to-speech technology has revolutionized how we interact with digital content. It enables accessibility for visually impaired users, helps with language learning, and makes content consumption more convenient. VoiceLab Pro uses advanced AI to generate high-quality, natural-sounding speech that captures the nuances of human voice, including intonation, emotion, and clarity.'
  },
  {
    label: 'Story',
    icon: '📖',
    text: 'Once upon a time, in a world where technology and creativity merged, there was a platform called VoiceLab Pro. It transformed the way people communicated, making every word come alive with the power of artificial intelligence. The future of voice interaction was here, and it was beautiful.'
  },
  {
    label: 'With Audio Tags',
    icon: '🎭',
    text: '[excited] You are NOT going to believe this! [frustrated sigh] I was seriously about to just trash the whole thing... But then! [happy gasp] It all just CLICKED. [laughs] Sometimes the best solutions come when you least expect them!'
  },
  {
    label: 'Multi-Speaker',
    icon: '👥',
    text: 'Speaker 1: [excitedly] Have you tried the new model?\n\nSpeaker 2: [curiously] Just got it! The clarity is amazing.\n\nSpeaker 1: [impressed] That\'s so much better than before!'
  },
  {
    label: 'Technical',
    icon: '💻',
    text: 'FastAPI is a modern, fast web framework for building APIs with Python. It is based on standard Python type hints and uses Pydantic for data validation. Next.js is a React framework that enables server-side rendering and static site generation, providing excellent performance and developer experience.'
  }
];

// Available models
const MODELS = [
  { id: 'eleven_v3', name: 'Eleven v3 (Alpha)', languages: 70, description: 'Most expressive, emotional control, dialogue mode' },
  { id: 'eleven_multilingual_v2', name: 'Eleven Multilingual v2', languages: 29, description: 'Lifelike, consistent quality' },
  { id: 'eleven_monolingual_v1', name: 'Eleven Monolingual v1', languages: 1, description: 'English only, high quality' },
  { id: 'eleven_flash_v2_5', name: 'Eleven Flash v2.5', languages: 32, description: 'Ultra-low latency (~75ms)' },
  { id: 'eleven_turbo_v2_5', name: 'Eleven Turbo v2.5', languages: 32, description: 'High quality, low latency' },
];

// Supported languages (32 total)
const LANGUAGES = [
  { code: 'en', name: 'English', variants: ['USA', 'UK', 'Australia', 'Canada'] },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'fr', name: 'French', variants: ['France', 'Canada'] },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese', variants: ['Brazil', 'Portugal'] },
  { code: 'it', name: 'Italian' },
  { code: 'es', name: 'Spanish', variants: ['Spain', 'Mexico'] },
  { code: 'id', name: 'Indonesian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'tr', name: 'Turkish' },
  { code: 'fil', name: 'Filipino' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ar', name: 'Arabic', variants: ['Saudi Arabia', 'UAE'] },
  { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' },
  { code: 'fi', name: 'Finnish' },
  { code: 'hr', name: 'Croatian' },
  { code: 'ms', name: 'Malay' },
  { code: 'sk', name: 'Slovak' },
  { code: 'da', name: 'Danish' },
  { code: 'ta', name: 'Tamil' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ru', name: 'Russian' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'no', name: 'Norwegian' },
  { code: 'vi', name: 'Vietnamese' },
];

export default function TTSPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioElement, setAudioElement] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [textMode, setTextMode] = useState('plain'); // 'plain' or 'formatted'
  const [speakerMode, setSpeakerMode] = useState('single'); // 'single' or 'multi'
  const [selectedModel, setSelectedModel] = useState('eleven_v3');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Load available voices
    const loadVoices = async () => {
      if (!isAuthenticated) return;
      
      setLoadingVoices(true);
      try {
        const response = await apiClient.getVoices();
        setVoices(response.voices || []);
        // Set first voice as default if available
        if (response.voices && response.voices.length > 0 && !selectedVoice) {
          setSelectedVoice(response.voices[0].voice_id);
        }
      } catch (err) {
        console.error('Failed to load voices:', err);
        // Continue without voices - user can still use default
      } finally {
        setLoadingVoices(false);
      }
    };

    loadVoices();
  }, [isAuthenticated]);

  useEffect(() => {
    // Clean up audio element on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
      }
    };
  }, [audioElement]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAudioUrl(null);

    if (!text.trim()) {
      setError('Please enter some text');
      setLoading(false);
      return;
    }

    // Format text for multi-speaker mode if needed
    let processedText = text;
    if (speakerMode === 'multi') {
      // Multi-speaker format: "Speaker 1: [excited] Hello! Speaker 2: [curiously] Hi there!"
      // The text should already be formatted by the user, but we can add guidance
      if (!text.includes(':') && !text.includes('Speaker')) {
        // Add a hint that multi-speaker format is expected
        // For now, we'll just use the text as-is and let ElevenLabs handle it
      }
    }

    try {
      const response = await apiClient.generateTTS(processedText, selectedVoice || null, {
        modelId: selectedModel,
        language: selectedLanguage || undefined,
        isMultiSpeaker: speakerMode === 'multi'
      });
      setAudioUrl(response.audio_url);
      
      // Create audio element for playback
      const audio = new Audio(response.audio_url);
      setAudioElement(audio);
    } catch (err) {
      setError(err.message || 'Failed to generate audio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'tts-audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSampleText = (sampleText) => {
    setText(sampleText);
    setError('');
    setAudioUrl(null);
    // Scroll to textarea
    setTimeout(() => {
      document.getElementById('text')?.focus();
    }, 100);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 flex">
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:mr-80' : ''}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-200/50 p-6 sm:p-8 lg:p-10 animate-slide-up">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-20"></div>
                      <FiVolume2 className="relative w-8 h-8 text-primary-600" />
                    </div>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Text-to-Speech
                    </span>
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Transform your text into natural, human-like speech
                  </p>
                </div>
                {/* Mobile sidebar toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <FiChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                {/* Mode Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Text Mode Toggle */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-soft hover:shadow-md transition-all">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Text Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTextMode('plain')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          textMode === 'plain'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Plain Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextMode('formatted')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          textMode === 'formatted'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Formatted (Audio Tags)
                      </button>
                    </div>
                  </div>

                  {/* Speaker Mode Toggle */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-soft hover:shadow-md transition-all">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Speaker Mode
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSpeakerMode('single')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          speakerMode === 'single'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Single
                      </button>
                      <button
                        type="button"
                        onClick={() => setSpeakerMode('multi')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          speakerMode === 'multi'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Multi-Speaker
                      </button>
                    </div>
                  </div>
                </div>

                {/* Model and Language Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Model Selection */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-soft hover:shadow-md transition-all">
                    <label htmlFor="model" className="block text-sm font-semibold text-gray-700 mb-2">
                      Voice Model
                    </label>
                    <select
                      id="model"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium text-gray-700 transition-all"
                    >
                      {MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name} ({model.languages} languages)
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      {MODELS.find(m => m.id === selectedModel)?.description}
                    </p>
                  </div>

                  {/* Language Selection */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 shadow-soft hover:shadow-md transition-all">
                    <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">
                      Language (Optional)
                    </label>
                    <select
                      id="language"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium text-gray-700 transition-all"
                    >
                      <option value="">Auto-detect</option>
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name} {lang.variants && `(${lang.variants.join(', ')})`}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty for auto-detection
                    </p>
                  </div>
                </div>

                {/* Voice Selection */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-100">
                  <label
                    htmlFor="voice"
                    className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <FiSettings className="w-4 h-4" />
                    Voice Selection
                  </label>
                  {loadingVoices ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Loading voices...</span>
                    </div>
                  ) : (
                    <select
                      id="voice"
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium text-gray-700 transition-all"
                    >
                      {voices.length === 0 ? (
                        <option value="">Default Voice (Loading...)</option>
                      ) : (
                        <>
                          <optgroup label="Default Voices">
                            {voices
                              .filter(v => v.category === 'premade' || v.category === 'default' || !v.category)
                              .map((voice) => (
                                <option key={voice.voice_id} value={voice.voice_id}>
                                  {voice.name}
                                </option>
                              ))}
                          </optgroup>
                          {voices.some(v => v.category && v.category !== 'premade' && v.category !== 'default') && (
                            <optgroup label="Other Voices">
                              {voices
                                .filter(v => v.category && v.category !== 'premade' && v.category !== 'default')
                                .map((voice) => (
                                  <option key={voice.voice_id} value={voice.voice_id}>
                                    {voice.name} ({voice.category})
                                  </option>
                                ))}
                            </optgroup>
                          )}
                        </>
                      )}
                    </select>
                  )}
                  {selectedVoice && voices.find(v => v.voice_id === selectedVoice) && (
                    <div className="mt-2 space-y-1">
                      {voices.find(v => v.voice_id === selectedVoice)?.description && (
                        <p className="text-xs text-gray-500">
                          {voices.find(v => v.voice_id === selectedVoice)?.description}
                        </p>
                      )}
                      {voices.find(v => v.voice_id === selectedVoice)?.category && (
                        <p className="text-xs text-gray-400">
                          Category: {voices.find(v => v.voice_id === selectedVoice)?.category}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Text Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="text"
                      className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <FiType className="w-4 h-4" />
                      Text Input
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowFormattingHelp(!showFormattingHelp)}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <FiHelpCircle className="w-4 h-4" />
                      <span>Formatting Tips</span>
                      {showFormattingHelp ? (
                        <FiChevronUp className="w-3 h-3" />
                      ) : (
                        <FiChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  
                  {/* Formatting Help Panel */}
                  {showFormattingHelp && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm animate-fade-in">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {textMode === 'formatted' ? 'Audio Tags Formatting Guide' : 'Text Formatting Tips'}
                      </h3>
                      
                      <div className="space-y-3 text-gray-700">
                        {textMode === 'formatted' ? (
                          <>
                            <div>
                              <p className="font-medium mb-1">Audio Tags (use square brackets []):</p>
                              <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                                <li><strong>Emotions:</strong> [excited], [sarcastic], [curious], [whispers], [laughs]</li>
                                <li><strong>Sounds:</strong> [sighs], [exhales], [crying], [applause], [gunshot]</li>
                                <li><strong>Special:</strong> [strong British accent], [sings], [woo]</li>
                              </ul>
                              <p className="mt-2 text-xs italic">Example: "[excited] You are NOT going to believe this! [laughs]"</p>
                            </div>
                            
                            {speakerMode === 'multi' && (
                              <div>
                                <p className="font-medium mb-1">Multi-Speaker Format:</p>
                                <p className="text-xs mb-1">Use format: "Speaker 1: [excited] Hello! Speaker 2: [curiously] Hi there!"</p>
                                <p className="text-xs italic">Example: "Speaker 1: [excitedly] Have you tried the new model? Speaker 2: [curiously] Just got it! The clarity is amazing."</p>
                              </div>
                            )}
                            
                            <div>
                              <p className="font-medium mb-1">Punctuation Tips:</p>
                              <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                                <li><strong>Ellipses (...):</strong> Add pauses - "It was... difficult"</li>
                                <li><strong>CAPITALIZATION:</strong> Increases emphasis - "That was AMAZING!"</li>
                                <li><strong>Hyphens:</strong> For interruptions - "Hello, is this seat-"</li>
                              </ul>
                            </div>
                          </>
                        ) : (
                          <div>
                            <p className="font-medium mb-1">Plain Text Mode:</p>
                            <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                              <li>Enter natural, conversational text</li>
                              <li>Use proper punctuation for natural pauses</li>
                              <li>Minimum 250 characters recommended for best results</li>
                              <li>Write as people actually speak</li>
                            </ul>
                            {speakerMode === 'multi' && (
                              <p className="mt-2 text-xs italic">For multi-speaker, use format: "Speaker 1: Hello! Speaker 2: Hi there!"</p>
                            )}
                          </div>
                        )}
                        
                        <div>
                          <p className="font-medium mb-1">Best Practices:</p>
                          <ul className="list-disc list-inside ml-2 space-y-1 text-xs">
                            <li>Use prompts greater than 250 characters for consistency</li>
                            <li>Write naturally as people actually speak</li>
                            <li>Match voice characteristics to your content</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  <textarea
                    id="text"
                    rows={speakerMode === 'multi' ? 12 : 10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm transition-all duration-200 bg-white font-mono"
                    placeholder={
                      speakerMode === 'multi'
                        ? textMode === 'formatted'
                          ? 'Speaker 1: [excited] Hello! Speaker 2: [curiously] Hi there!\n\nOr use plain text:\nSpeaker 1: Hello! Speaker 2: Hi there!'
                          : 'Speaker 1: Hello! Speaker 2: Hi there!\n\nFormat: "Speaker Name: dialogue"'
                        : textMode === 'formatted'
                        ? 'Enter text with Audio Tags: [excited] You are NOT going to believe this! [laughs]'
                        : 'Enter the text you want to convert to speech... Or select a sample from the sidebar!'
                    }
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {text.length} characters
                    </p>
                    {text.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setText('')}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg animate-fade-in flex items-center gap-2">
                    <FiX className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={loading || !text.trim()}
                  className="w-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-primary-700 hover:via-primary-600 hover:to-accent-700 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <>
                      <AnimatedSpeaker size={20} />
                      <span className="animate-pulse">Generating Audio...</span>
                    </>
                  ) : (
                    <>
                      <FiZap className="w-5 h-5" />
                      <span>Generate Audio</span>
                    </>
                  )}
                </button>
                
                {/* Loading State Overlay */}
                {loading && (
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 animate-slide-up">
                      <div className="flex flex-col items-center space-y-4">
                        <AnimatedSpeaker size={48} />
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Audio</h3>
                          <p className="text-sm text-gray-600">This may take a few moments...</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full animate-shimmer" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>

              {/* Generated Audio */}
              {audioUrl && (
                <div className="mt-8 p-6 sm:p-8 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl border-2 border-green-200/50 animate-fade-in shadow-soft">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FiVolume2 className="w-5 h-5 text-green-600" />
                    </div>
                    <span>Generated Audio</span>
                  </h2>
                  <div className="bg-white rounded-xl p-4 shadow-inner border border-green-200/50 mb-6">
                    <audio
                      ref={(el) => {
                        if (el && audioElement) {
                          el.src = audioElement.src;
                        }
                      }}
                      controls
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        if (audioElement) {
                          audioElement.play();
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <FiPlay className="w-4 h-4" />
                      Play Audio
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen lg:h-auto bg-white/95 backdrop-blur-sm border-l border-gray-200/50 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        } w-80 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-primary-50 via-accent-50/30 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FiType className="w-5 h-5 text-primary-600" />
              </div>
              <span>Sample Texts</span>
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/80 transition-all"
              aria-label="Close sidebar"
            >
              <FiX className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Click any sample to use it as input
          </p>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {SAMPLE_TEXTS.map((sample, index) => (
            <button
              key={index}
              onClick={() => handleSampleText(sample.text)}
              className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-gradient-to-br hover:from-primary-50 hover:to-accent-50/30 transition-all duration-200 group shadow-soft hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {sample.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {sample.label}
                    </span>
                    <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-700">
                    {sample.text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200/50 bg-gradient-to-br from-gray-50 to-white">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <FiChevronLeft className="w-4 h-4" />
            Close Sidebar
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar Toggle Button (when closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary-600 to-accent-600 text-white p-4 rounded-full shadow-2xl hover:from-primary-700 hover:to-accent-700 transition-all transform hover:scale-110 active:scale-95 animate-bounce-subtle"
          aria-label="Open sidebar"
        >
          <FiType className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
