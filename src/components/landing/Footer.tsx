import React from 'react';
import { Twitter, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md transform -rotate-3 mr-3">
              <span className="text-xl">🦊</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Social Fox</h3>
          </div>

          <div className="flex space-x-8 mb-8">
            <a
              href="https://twitter.com/socialfoxapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              <Twitter className="w-6 h-6" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://github.com/socialfox"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              <Github className="w-6 h-6" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="mailto:hello@socialfox.dev"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              <Mail className="w-6 h-6" />
              <span className="sr-only">Email</span>
            </a>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-600">
            <p>&copy; 2025 Social Fox. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;