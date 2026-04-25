"use client";

import React, { useState, useEffect } from 'react';
import { X, Cookie as CookieIcon } from 'lucide-react';

const CookieModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const checkCookieConsent = () => {
      const hasAccepted = localStorage.getItem('cookieAccepted');
      if (!hasAccepted) {
        setIsVisible(true);
      }
    };

    // Wait 5 seconds before checking cookie consent
    const timer = setTimeout(checkCookieConsent, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Store acceptance in localStorage
    localStorage.setItem('cookieAccepted', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <CookieIcon size={20} className="text-blue-400" />
          <span className="hidden sm:inline">
            We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          </span>
          <span className="sm:hidden">
            We use cookies to improve your experience.
          </span>
          <a href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline ml-1">
            Learn more
          </a>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors font-medium"
          >
            Accept
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-800 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieModal;