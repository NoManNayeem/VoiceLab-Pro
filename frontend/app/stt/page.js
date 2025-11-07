'use client';

import { FiMic, FiClock, FiZap } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';

function STTPageContent() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-200/50 p-8 sm:p-12 animate-slide-up">
          <div className="mb-6">
            <Link
              href="/providers"
              className="text-sm text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center gap-2"
            >
              ← Back to providers
            </Link>
          </div>
          <div className="text-center">
            <div className="inline-block mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl blur-2xl opacity-30 animate-pulse-slow"></div>
                <div className="relative p-6 bg-gradient-to-br from-accent-100 to-primary-100 rounded-2xl">
                  <FiMic className="w-16 h-16 sm:w-20 sm:h-20 text-accent-600 mx-auto animate-float" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Speech-to-Text
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Coming Soon
            </p>
            <p className="text-gray-500 mb-12 max-w-xl mx-auto leading-relaxed">
              This feature is currently under development. We're working hard to bring you advanced speech-to-text capabilities with real-time transcription and multi-language support.
            </p>

            {/* Coming Soon Features */}
            <div className="grid sm:grid-cols-2 gap-6 mt-12 text-left">
              <div className="p-6 bg-gradient-to-br from-primary-50 to-accent-50/30 rounded-xl border border-primary-200/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FaBrain className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                </div>
                <p className="text-sm text-gray-600">Advanced AI models for accurate transcription</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-accent-50 to-primary-50/30 rounded-xl border border-accent-200/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FiZap className="w-5 h-5 text-accent-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Real-Time</h3>
                </div>
                <p className="text-sm text-gray-600">Live transcription as you speak</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-primary-50 to-accent-50/30 rounded-xl border border-primary-200/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FiMic className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Multi-Language</h3>
                </div>
                <p className="text-sm text-gray-600">Support for 32+ languages</p>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-accent-50 to-primary-50/30 rounded-xl border border-accent-200/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FiClock className="w-5 h-5 text-accent-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Coming Soon</h3>
                </div>
                <p className="text-sm text-gray-600">Stay tuned for updates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function STTPage() {
  return (
    <ProtectedRoute>
      <STTPageContent />
    </ProtectedRoute>
  );
}
