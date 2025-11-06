'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { FiHome, FiLogIn, FiLogOut, FiMic, FiType, FiMenu, FiX, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <span className="relative text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                VoiceLab Pro
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link
                  href="/tts"
                  className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <FiType className="w-4 h-4" />
                  <span>TTS</span>
                </Link>
                <Link
                  href="/stt"
                  className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <FiMic className="w-4 h-4" />
                  <span>STT</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <FiUser className="w-4 h-4" />
                  <span>About</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <FiHome className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/about"
                  className="flex items-center space-x-1.5 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-3 py-2 rounded-lg text-sm font-medium"
                >
                  <FiUser className="w-4 h-4" />
                  <span>About</span>
                </Link>
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 transition-all px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg"
                >
                  <FiLogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/tts"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <FiType className="w-4 h-4" />
                    <span>TTS</span>
                  </Link>
                  <Link
                    href="/stt"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <FiMic className="w-4 h-4" />
                    <span>STT</span>
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>About</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all px-4 py-2 rounded-lg text-sm font-medium text-left"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <FiHome className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>About</span>
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 transition-all px-4 py-2 rounded-lg text-sm font-medium shadow-md"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

