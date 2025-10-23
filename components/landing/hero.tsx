'use client';

import React from 'react';
import Image from 'next/image';
import { Github, Linkedin, Zap, User, Twitter, ArrowRight, Sparkles, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from "@clerk/nextjs";

const Hero = () => {
  const { user } = useUser();

  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Navigation Header */}
        <div className="flex justify-end items-center mb-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700">
              <a
                href="https://twitter.com/heynathanielj"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter: @heynathanielj"
              >
                <Twitter className="w-4 h-4 text-orange-500 fill-orange-500" />
              </a>
            </Button>
            <Link href={user ? "/calendar" : "/sign-up"}>
              <Button variant="outline" className="flex items-center space-x-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700">
                <User className="w-4 h-4" />
                <span>{user ? "Dashboard" : "Get Started"}</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="text-center py-6 md:py-12">
          <div className="flex justify-center items-center mb-12">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Image src="/fox-logo.png" alt="Fox Logo" width={50} height={50} />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 rounded-full px-4 py-2 text-sm font-medium text-orange-700 dark:text-orange-300 mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Content Automation</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-orange-600 bg-clip-text text-transparent leading-tight">
            Set It & Forget It — Plan Your             
            <span className="block bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Tweets in Minutes 
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform bland updates into engaging threads, automate your schedule, and grow your presence without lifting a finger.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full font-medium text-sm">
              <Clock className="w-4 h-4" />
              30‑Day Scheduler
            </span>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full font-medium text-sm">
              <Zap className="w-4 h-4" />
              AI Drafts
            </span>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-2 rounded-full font-medium text-sm">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </span>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full font-medium text-sm">
              <span className="text-lg">🧵</span>
              Threads
            </span>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 px-4 py-2 rounded-full font-medium text-sm">
              <span className="text-lg">📚</span>
              Library
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="group flex items-center gap-3 bg-white/80 dark:bg-background/80 backdrop-blur-md rounded-full px-6 py-3 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">93% time saved</span>
            </div>
            <div className="group flex items-center gap-3 bg-white/80 dark:bg-background/80 backdrop-blur-md rounded-full px-6 py-3 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">87% more engaging content</span>
            </div>
            <div className="group flex items-center gap-3 bg-white/80 dark:bg-background/80 backdrop-blur-md rounded-full px-6 py-3 border border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">Powered by AI</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/sign-up" as={`/sign-up?openTab=signup&returnTo=/calendar`}>
              <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Automate My Tweets
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <div className="flex items-center">
              <a
                href="https://www.producthunt.com/products/socialfox-build-in-public-effortlessly?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-socialfox&#0045;build&#0045;in&#0045;public&#0045;effortlessly"
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1009418&theme=light&t=1756165331728"
                  alt="Socialfox — Build in public effortlessly - Turn your GitHub commits into content for X and LinkedIn. | Product Hunt"
                  width={200}
                  height={40}
                  className="group-hover:shadow-lg transition-shadow duration-300"
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