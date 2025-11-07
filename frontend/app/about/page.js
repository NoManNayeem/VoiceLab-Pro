'use client';

import { FiGithub, FiLinkedin, FiMail, FiCode, FiCpu, FiTrendingUp, FiUsers, FiAward } from 'react-icons/fi';
import { FaBrain, FaRocket } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 via-transparent to-accent-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center shadow-2xl animate-float">
                <span className="text-5xl font-bold text-white">NI</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 animate-slide-up">
              Nayeem Islam
            </h1>
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                Tech Lead
              </span>
              <span className="px-4 py-2 bg-accent-100 text-accent-700 rounded-full text-sm font-semibold">
                AI Enabler
              </span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                Full Stack Developer
              </span>
            </div>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Transforming ideas into innovative solutions through cutting-edge technology and artificial intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* About Section */}
        <div className="bg-white rounded-2xl shadow-soft p-8 sm:p-12 mb-8 animate-slide-up">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FiCode className="w-8 h-8 text-primary-600" />
            About
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4 text-lg">
              Nayeem Islam is a seasoned <strong className="text-gray-900">Tech Lead</strong> and <strong className="text-gray-900">AI Enabler</strong> with a passion for building innovative solutions that leverage the power of artificial intelligence and modern web technologies.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4 text-lg">
              With extensive experience in full-stack development, Nayeem specializes in architecting scalable systems, leading technical teams, and enabling organizations to harness the transformative potential of AI technologies. His expertise spans across modern frameworks, cloud infrastructure, and machine learning integration.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              As an AI Enabler, Nayeem focuses on making advanced AI capabilities accessible and practical for real-world applications, bridging the gap between cutting-edge research and production-ready solutions.
            </p>
          </div>
        </div>

        {/* Skills & Expertise */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-8 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FiCpu className="w-6 h-6 text-primary-600" />
              Technical Expertise
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Full Stack Development</h4>
                <p className="text-gray-600 text-sm">Modern frameworks, RESTful APIs, microservices architecture</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">AI & Machine Learning</h4>
                <p className="text-gray-600 text-sm">NLP, TTS/STT, model integration, AI-powered applications</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cloud & DevOps</h4>
                <p className="text-gray-600 text-sm">Cloud infrastructure, containerization, CI/CD pipelines</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Leadership & Strategy</h4>
                <p className="text-gray-600 text-sm">Technical leadership, team mentoring, architectural decisions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaBrain className="w-6 h-6 text-accent-600" />
              Core Competencies
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FiTrendingUp className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Innovation & Strategy</h4>
                  <p className="text-gray-600 text-sm">Driving technological innovation and strategic planning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiUsers className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Team Leadership</h4>
                  <p className="text-gray-600 text-sm">Building and leading high-performing technical teams</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaRocket className="w-5 h-5 text-accent-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">AI Enablement</h4>
                  <p className="text-gray-600 text-sm">Making AI accessible and practical for business solutions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiAward className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Best Practices</h4>
                  <p className="text-gray-600 text-sm">Implementing industry standards and best practices</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl shadow-soft p-8 sm:p-12 animate-slide-up">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Connect</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/NoManNayeem"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 font-medium"
            >
              <FiGithub className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/nayeem-islam"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 font-medium"
            >
              <FiLinkedin className="w-5 h-5" />
              <span>LinkedIn</span>
            </a>
            <a
              href="mailto:contact@voicelabpro.com"
              className="flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105 text-gray-700 font-medium"
            >
              <FiMail className="w-5 h-5" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

