import Link from 'next/link';
import { FiMic, FiType, FiArrowRight, FiZap, FiShield, FiGlobe } from 'react-icons/fi';
import { FaBrain, FaRocket } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-2xl opacity-30 animate-pulse-slow"></div>
                <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent mb-6">
                  VoiceLab Pro
                </h1>
              </div>
            </div>
            <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed animate-slide-up">
              Transform text into natural speech with cutting-edge AI technology
            </p>
            <p className="text-base sm:text-lg text-gray-500 mb-8 max-w-2xl mx-auto animate-slide-up">
              Simple, fast, and free to try. No technical knowledge required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 animate-slide-up">
              <Link
                href="/login"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/50 transform hover:-translate-y-1 active:translate-y-0"
              >
                <span>Get Started</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center space-x-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <FiType className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Text-to-Speech
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Convert any text into natural, human-like speech with multiple voice options, languages, and advanced formatting controls.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <FiMic className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Speech-to-Text
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Transcribe audio files into accurate text. Coming soon with advanced features for real-time transcription and multiple languages.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-soft hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up md:col-span-2 lg:col-span-1" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <FaBrain className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              AI-Powered
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Powered by ElevenLabs advanced AI models for the highest quality voice synthesis and recognition.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In</h3>
              <p className="text-gray-600 text-sm">
                Use the demo account or create your own to get started
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-accent-600">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Provider</h3>
              <p className="text-gray-600 text-sm">
                Select ElevenLabs or Cartesia AI based on your needs
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary-600">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate & Play</h3>
              <p className="text-gray-600 text-sm">
                Type your text, click generate, and listen to your audio
              </p>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur-sm">
            <FiZap className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Fast Processing</h4>
            <p className="text-sm text-gray-600">Ultra-low latency generation</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur-sm">
            <FiGlobe className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">32 Languages</h4>
            <p className="text-sm text-gray-600">Multilingual support</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur-sm">
            <FiShield className="w-8 h-8 text-primary-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
            <p className="text-sm text-gray-600">Your data is protected</p>
          </div>
          <div className="text-center p-6 bg-white/50 rounded-xl backdrop-blur-sm">
            <FaRocket className="w-8 h-8 text-accent-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Easy to Use</h4>
            <p className="text-sm text-gray-600">Intuitive interface</p>
          </div>
        </div>
      </div>
    </div>
  );
}

