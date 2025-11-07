import '../styles/globals.css';
import { AuthProvider } from '../components/AuthProvider';
import { ToastProvider } from '../components/Toast';
import ErrorBoundary from '../components/ErrorBoundary';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'VoiceLab Pro - TTS & STT Platform',
  description: 'Transform text into natural speech and convert speech to text with cutting-edge AI technology. Built by Nayeem Islam, Tech Lead and AI Enabler.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <div className="flex flex-col min-h-screen bg-gray-50">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

