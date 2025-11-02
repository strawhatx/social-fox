'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { User, Twitter, ChevronDown, Menu, X, Home } from 'lucide-react';
import { useUser } from "@clerk/nextjs";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu as HeadlessMenu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

const playbooks = [
    { name: 'Consistency Playbook', href: '/playbooks/consistency' },
    { name: 'AI Threads Playbook', href: '/playbooks/ai-threads' }
];

const features = [
    { name: 'Thread Planner', href: '/features/thread-planner' },
    { name: 'Calendar Scheduler', href: '/features/calendar-scheduler' },
    { name: 'Template Library', href: '/features/template-library' },
    { name: 'AI Content Generation', href: '/features/ai-content' },
    { name: 'Analytics', href: '/features/analytics' },
];

const integrations = [
    { name: 'Twitter/X Integration', href: '/integrations/twitter' },
];

const comparisons = [
    { name: 'vs Typefully', href: '/comparison/typefully' },
    { name: 'vs Hypefury', href: '/comparison/hypefury' },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

const Navigation = () => {
    const { user } = useUser();

    return (
        <Disclosure as="nav" className="relative dark:bg-gray-900">
            <div className="w-full max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    {/* Mobile menu button */}
                    <div className="absolute inset-y-0 left-0 flex items-center md:hidden">
                        <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus:outline-2 focus:-outline-offset-1 focus:outline-orange-500">
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Open main menu</span>
                            <Menu aria-hidden="true" className="block size-6 group-data-[open]:hidden" />
                            <X aria-hidden="true" className="hidden size-6 group-data-[open]:block" />
                        </DisclosureButton>
                    </div>

                    {/* Logo */}
                    <div className="flex flex-1 items-center justify-center md:items-stretch md:justify-start">
                        <div className="flex shrink-0 items-center">
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                                    <Image src="/fox-logo.png" alt="Social Fox" width={20} height={20} />
                                </div>
                                <span className="hidden lg:block text-xl font-bold bg-gradient-to-r from-foreground to-orange-600 bg-clip-text text-transparent">
                                    Social Fox
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:ml-6 md:block">
                            <div className="flex space-x-4">
                                {/* Pricing Link */}
                                <Link
                                    href="/pricing"
                                    className="text-gray-700 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium"
                                >
                                    Pricing
                                </Link>

                                {/* Playbooks Dropdown */}
                                <HeadlessMenu as="div" className="relative">
                                    <MenuButton className="text-gray-700 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium flex items-center gap-1">
                                        Playbooks
                                        <ChevronDown className="w-4 h-4" />
                                    </MenuButton>
                                    <MenuItems className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {playbooks.map((item) => (
                                            <MenuItem key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    {item.name}
                                                </Link>
                                            </MenuItem>
                                        ))}
                                    </MenuItems>
                                </HeadlessMenu>

                                {/* Features Dropdown */}
                                <HeadlessMenu as="div" className="relative">
                                    <MenuButton className="text-gray-700 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium flex items-center gap-1">
                                        Features
                                        <ChevronDown className="w-4 h-4" />
                                    </MenuButton>
                                    <MenuItems className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {features.map((item) => (
                                            <MenuItem key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    {item.name}
                                                </Link>
                                            </MenuItem>
                                        ))}
                                    </MenuItems>
                                </HeadlessMenu>

                                {/* Integrations Dropdown */}
                                <HeadlessMenu as="div" className="relative">
                                    <MenuButton className="text-gray-700 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium flex items-center gap-1">
                                        Integrations
                                        <ChevronDown className="w-4 h-4" />
                                    </MenuButton>
                                    <MenuItems className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {integrations.map((item) => (
                                            <MenuItem key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    {item.name}
                                                </Link>
                                            </MenuItem>
                                        ))}
                                    </MenuItems>
                                </HeadlessMenu>

                                {/* Compare Dropdown */}
                                <HeadlessMenu as="div" className="relative">
                                    <MenuButton className="text-gray-700 hover:text-gray-900 rounded-md px-3 py-2 text-sm font-medium flex items-center gap-1">
                                        Compare
                                        <ChevronDown className="w-4 h-4" />
                                    </MenuButton>
                                    <MenuItems className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        {comparisons.map((item) => (
                                            <MenuItem key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    {item.name}
                                                </Link>
                                            </MenuItem>
                                        ))}
                                    </MenuItems>
                                </HeadlessMenu>
                            </div>
                        </div>
                    </div>

                    {/* Right side buttons */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:static md:inset-auto md:ml-6 md:pr-0">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="hidden md:flex border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 mr-2">
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
            </div>

            {/* Mobile Menu */}
            <DisclosurePanel className="md:hidden">
                <div className="space-y-1 px-2 pt-2 pb-3">
                    {/* Pricing Mobile */}
                    <Link
                        href="/pricing"
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                        Pricing
                    </Link>

                    {/* Playbooks Mobile */}
                    <div>
                        <div className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium mb-2">
                            Playbooks
                        </div>
                        <div className="ml-4 space-y-1">
                            {playbooks.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Features Mobile */}
                    <div>
                        <div className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium mb-2">
                            Features
                        </div>
                        <div className="ml-4 space-y-1">
                            {features.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Integrations Mobile */}
                    <div>
                        <div className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium mb-2">
                            Integrations
                        </div>
                        <div className="ml-4 space-y-1">
                            {integrations.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Compare Mobile */}
                    <div>
                        <div className="text-gray-700 block rounded-md px-3 py-2 text-base font-medium mb-2">
                            Compare
                        </div>
                        <div className="ml-4 space-y-1">
                            {comparisons.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-col gap-3">
                            <Button variant="outline" size="icon" asChild className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 w-full">
                                <a
                                    href="https://twitter.com/heynathanielj"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Twitter: @heynathanielj"
                                >
                                    <Twitter className="w-4 h-4 text-orange-500 fill-orange-500" />
                                </a>
                            </Button>
                            <Link href={user ? "/calendar" : "/sign-up"} className="w-full">
                                <Button variant="outline" className="flex items-center justify-center space-x-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 w-full">
                                    <User className="w-4 h-4" />
                                    <span>{user ? "Dashboard" : "Get Started"}</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DisclosurePanel>
        </Disclosure>
    );
};

export default Navigation;
