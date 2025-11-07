'use client';

import { useRouter } from 'next/navigation';
import { FiZap, FiMic, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

export default function ProvidersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-4">
            Choose Your TTS Provider
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            Select a provider to start generating high-quality text-to-speech audio
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Both providers offer excellent quality. Choose based on your needs below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {/* ElevenLabs Card */}
          <div className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <FiZap className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ElevenLabs
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Best for creative projects, storytelling, and expressive content. Offers advanced emotional control and voice customization.
            </p>
            <div className="mb-6 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-xs text-primary-800 font-medium mb-1">💡 Best for:</p>
              <p className="text-xs text-primary-700">Podcasts, audiobooks, creative content, emotional storytelling</p>
            </div>
            <ul className="text-sm text-gray-500 mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-primary-600">✓</span>
                <span>32+ languages supported</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-600">✓</span>
                <span>Audio tags for emotional control</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary-600">✓</span>
                <span>Voice cloning & design</span>
              </li>
            </ul>
            <Link
              href="/tts/elevenlabs"
              className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Try ElevenLabs</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Cartesia AI Card */}
          <div className="group bg-white rounded-2xl shadow-soft p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <FiTrendingUp className="w-8 h-8 text-accent-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Cartesia AI
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Best for real-time applications, quick generation, and conversational AI. Ultra-fast with 90ms latency.
            </p>
            <div className="mb-6 p-3 bg-accent-50 border border-accent-200 rounded-lg">
              <p className="text-xs text-accent-800 font-medium mb-1">💡 Best for:</p>
              <p className="text-xs text-accent-700">Real-time apps, quick demos, conversational AI, live interactions</p>
            </div>
            <ul className="text-sm text-gray-500 mb-6 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-accent-600">✓</span>
                <span>90ms first-byte latency</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-600">✓</span>
                <span>40+ languages supported</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-600">✓</span>
                <span>Emotion & speed control</span>
              </li>
            </ul>
            <Link
              href="/tts/cartesia"
              className="inline-flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-accent-600 to-accent-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-accent-700 hover:to-accent-800 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Try Cartesia AI</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <span>← Back to home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

