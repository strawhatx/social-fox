'use client';


import Link from 'next/link';
import { Twitter, Mail, Linkedin } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md transform -rotate-3 mr-3">
              <Image src="/fox-logo.png" alt="Fox Logo" width={16} height={16} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Social Fox</h3>
          </div>

          <div className="flex space-x-8 mb-8">
            <a
              href="https://twitter.com/heynathanielj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              <Twitter className="w-6 h-6" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="https://www.linkedin.com/in/nathaniel-james-2658b1112"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              <Linkedin className="w-6 h-6" />
              <span className="sr-only">GitHub</span>
            </a>
            <a
              href="mailto:support@socialfox.dev"
              className="text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              <Mail className="w-6 h-6" />
              <span className="sr-only">Email</span>
            </a>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 text-sm text-gray-600">
            <p>&copy; 2025 Social Fox. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <Link href="/chatgpt-for-twitter" className="hover:text-orange-600">ChatGPT for Twitter</Link>
              <Link href="/ai-copilot-for-tweets" className="hover:text-orange-600">AI Copilot for Tweets</Link>
              <Link href="/ai-thread-writer" className="hover:text-orange-600">AI Thread Writer</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;