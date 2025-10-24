'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User, Twitter } from 'lucide-react';
import { useUser } from "@clerk/nextjs";

const Navigation = () => {
  const { user } = useUser();

  return (
    <div className="flex justify-between items-center py-6 px-4 sm:px-6 lg:px-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
          <Image src="/fox-logo.png" alt="Social Fox" width={20} height={20} />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
          Social Fox
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        <Link href="/playbooks" className="text-muted-foreground hover:text-foreground transition-colors">
          Playbooks
        </Link>
        <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
          Features
        </Link>
        <Link href="/integrations" className="text-muted-foreground hover:text-foreground transition-colors">
          Integrations
        </Link>
        <Link href="/comparison" className="text-muted-foreground hover:text-foreground transition-colors">
          Compare
        </Link>
      </nav>

      {/* Right side buttons */}
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
  );
};

export default Navigation;
