import Link from 'next/link';
import { FiGithub, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>&copy; {new Date().getFullYear()} VoiceLab Pro</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Built with</span>
            <FiHeart className="w-4 h-4 text-red-500 animate-pulse-slow" />
            <span className="hidden sm:inline">by</span>
            <Link href="/about" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Nayeem Islam
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/NoManNayeem/VoiceLab-Pro"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="GitHub"
            >
              <FiGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

