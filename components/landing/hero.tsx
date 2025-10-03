'use client';

import React from 'react';
import Image from 'next/image';
import { Github, Linkedin, Zap, User, Twitter, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from "@clerk/nextjs";

const Hero = () => {
  const { user } = useUser();

  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-orange-50 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-white/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <a
                href="https://twitter.com/heynathanielj"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter: @heynathanielj"
              >
                <Twitter className="w-4 h-4 text-brand-orange fill-orange-500" />
              </a>
            </Button>
            <Link href={user ? "/editor" : "/sign-up"}>
              <Button variant="outline" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{user ? "Dashboard" : "Get Started"}</span>
              </Button>
            </Link>
          </div>
        </div>
        <div className="text-center py-6 md:py-12">
          <div className="flex justify-center items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-3">
                <Image src="/fox-logo.png" alt="Fox Logo" width={40} height={40} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-gray-900 mb-4">
            <span className="block">Turn your 📝 ideas</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              into polished <span className="text-black">𝕏</span> posts
            </span>
          </h1>

          <p className="text-sm md:text-lg text-gray-700 mb-4 max-w-3xl mx-auto font-medium">
            Stop wasting hours writing threads that flop. Social Fox turns your rough thoughts into authentic, scroll‑stopping posts—fast, in your voice, and algorithm‑friendly.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">AI Copilot for X</span>
            <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">Conversation editing</span>
            <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">Scheduling</span>
            <span className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">Thread templates</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              href="/sign-up"
              as={`/sign-up?openTab=signup&returnTo=/editor`}
            >
              <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                Lets write your posts <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <div className="flex items-center">
              <a
                href="https://www.producthunt.com/products/socialfox-build-in-public-effortlessly?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-socialfox&#0045;build&#0045;in&#0045;public&#0045;effortlessly"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1009418&theme=light&t=1756165331728"
                  alt="Socialfox — Build in public effortlessly - Turn your GitHub commits into content for X and LinkedIn. | Product Hunt"
                  width={200}
                  height={40}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;