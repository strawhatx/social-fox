'use client';


import Link from 'next/link';
import { Twitter, Mail, Linkedin } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t pt-16 pb-4 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          {/* Brand + Social */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md transform -rotate-3 mr-3">
                <Image src="/fox-logo.png" alt="Fox Logo" width={16} height={16} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Social Fox</h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">Plan, draft, schedule, and grow on X with an operator-first workflow.</p>
            <div className="flex space-x-6 mb-6">
              <a href="https://twitter.com/heynathanielj" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 transition-colors">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://www.linkedin.com/in/nathaniel-james-2658b1112" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-orange-500 transition-colors">
                <Linkedin className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="mailto:support@socialfox.dev" className="text-gray-600 hover:text-orange-500 transition-colors">
                <Mail className="w-5 h-5" />
                <span className="sr-only">Email</span>
              </a>
            </div>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-4 py-2 rounded border text-gray-700 hover:text-gray-900 hover:border-gray-400 transition-colors"
            >
              <span>Back to top</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {/* Site Map */}
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Site Map</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li><Link href="/" className="hover:text-orange-600">Homepage</Link></li>
                <li><Link href="/playbooks/consistency" className="hover:text-orange-600">Consistency (Playbook)</Link></li>
                <li><Link href="/playbooks/ai-threads" className="hover:text-orange-600">AI Threads (Playbook)</Link></li>

                <li><Link href="/features/thread-planner" className="hover:text-orange-600">Thread Planner (Feature)</Link></li>
                <li><Link href="/features/calendar-scheduler" className="hover:text-orange-600">Calendar Scheduler (Feature)</Link></li>
                <li><Link href="/features/template-library" className="hover:text-orange-600">Template Library (Feature)</Link></li>
                <li><Link href="/features/ai-content" className="hover:text-orange-600">AI Content Generation (Feature)</Link></li>
                <li><Link href="/features/analytics" className="hover:text-orange-600">Analytics (Feature)</Link></li>
                <li><Link href="/comparison/typefully" className="hover:text-orange-600">Typefully (Comparison)</Link></li>
                <li><Link href="/comparison/hypefury" className="hover:text-orange-600">Hypefury (Comparison)</Link></li>
                <li><Link href="/integrations/twitter" className="hover:text-orange-600">Twitter/X Integration</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-700">
                <li><Link href="/legal/privacy" className="hover:text-orange-600">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-orange-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-6 w-full flex items-center gap-4 text-sm text-gray-600">
          <p className="text-center w-full">&copy; 2025 Social Fox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;