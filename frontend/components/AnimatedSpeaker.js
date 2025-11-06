'use client';

import { FiVolume2 } from 'react-icons/fi';

export default function AnimatedSpeaker({ size = 24, className = '' }) {
  const waveSize = size * 2.5;
  
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: waveSize, height: waveSize }}>
      {/* Animated waves */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="absolute rounded-full border-2 border-primary-400 animate-speaker-wave opacity-30"
          style={{ 
            width: waveSize, 
            height: waveSize,
            animationDelay: '0s'
          }}
        ></div>
        <div 
          className="absolute rounded-full border-2 border-primary-400 animate-speaker-wave opacity-20"
          style={{ 
            width: waveSize, 
            height: waveSize,
            animationDelay: '0.3s'
          }}
        ></div>
        <div 
          className="absolute rounded-full border-2 border-primary-400 animate-speaker-wave opacity-10"
          style={{ 
            width: waveSize, 
            height: waveSize,
            animationDelay: '0.6s'
          }}
        ></div>
      </div>
      {/* Speaker icon */}
      <div className="relative z-10">
        <FiVolume2 
          className="text-primary-600 animate-pulse-slow" 
          style={{ width: size, height: size }}
        />
      </div>
    </div>
  );
}

