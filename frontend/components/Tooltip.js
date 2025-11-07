'use client';

import { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';

export default function Tooltip({ text, children, position = 'top' }) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children || <FiHelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />}
      </div>
      {show && (
        <div
          className={`absolute z-50 ${positionClasses[position]} px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-fade-in`}
        >
          {text}
          <div
            className={`absolute ${
              position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t-gray-900' :
              position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900' :
              position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-900' :
              'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
            } border-4 border-transparent`}
          />
        </div>
      )}
    </div>
  );
}

