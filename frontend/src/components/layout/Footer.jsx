import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Digital Ekub</span>
          <span>© {currentYear}</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">All rights reserved</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#"
            className="hover:text-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="#"
            className="hover:text-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="#"
            className="hover:text-gray-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
        </div>

        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400">System Online</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;