'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import QuotaIndicator from '@/components/quota-indicator';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

const menuItems = [
  { id: 'home', title: 'Home', path: '/dashboard', icon: '🏠', color: 'text-blue-500 hover:bg-blue-50', stats: '7-day streak', description: 'View your posting streak and engagement stats' },
  { id: 'tweet-builder', title: 'Tweet Builder', path: '/tweet-builder', icon: '🐦', color: 'text-purple-500 hover:bg-purple-50', stats: '3 AI suggestions', description: 'Create tweets from commits and AI suggestions' },
  { id: "analytics", title: "Analytics", path: '/analytics', icon: "📊", color: "text-green-500 hover:bg-green-50", stats: "1 profile analyzed", description: "Analyze your own profile for actionable insights" },
  { id: 'scheduler', title: 'Scheduler', path: '/scheduler', icon: '📅', color: 'text-orange-500 hover:bg-orange-50', stats: '5 queued', description: 'Manage your scheduled tweets' },
];

function Sidebar({ menuItems, activeTab, isMobileSidebarOpen, setIsMobileSidebarOpen }: {
  menuItems: any[];
  activeTab: string;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}) {
  return (
    <>
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      <div
        className={`
          fixed left-0 top-0 h-full w-16 bg-sidebar border-r border-sidebar-border 
          flex flex-col items-center py-6 z-30 mini-sidebar shadow-lg
          transition-transform duration-200 ease-in-out
          md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-8 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <img src="/fox-logo.png" alt="Fox Logo" className="w-4 h-4" />
        </div>

        <nav className="flex flex-col gap-4 flex-1 w-full px-2">
          {menuItems.map((item) => (
            <Tooltip key={item.id} delayDuration={150}>
              <TooltipTrigger asChild>
                <Link
                  href={item.path}
                  className={`
                    w-full h-12 rounded-xl flex items-center justify-center text-lg
                    transition-all duration-200 relative group cursor-pointer
                    hover:shadow-md active:scale-95
                    ${activeTab === item.id
                      ? `${item.color.split(' ')[0]} bg-current bg-opacity-15 scale-105 shadow-lg`
                      : `text-muted-foreground hover:scale-105 ${item.color} hover:shadow-sm`
                    }
                  `}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <span className="group-hover:scale-110 transition-transform duration-150">
                    {item.icon}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="ml-3 hidden md:block max-w-64 p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <p className="font-medium text-sm">{item.title}</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-md ${item.color.split(' ')[1]} ${item.color.split(' ')[0]} bg-opacity-15 inline-block`}>
                    {item.stats}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </div>
    </>
  );
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const found = menuItems.find((item) => pathname?.startsWith(item.path));
    setActiveTab(found ? found.id : 'home');
  }, [pathname]);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((v) => !v);

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar
            menuItems={menuItems}
            activeTab={activeTab}
            isMobileSidebarOpen={isMobileSidebarOpen}
            setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          />
          <main className="flex-1 flex flex-col overflow-hidden md:ml-16">
            <header className="border-b border-border p-4 flex items-center gap-4 bg-background">
              <Button variant="ghost" size="sm" className="md:hidden w-10 h-10 p-0" onClick={toggleMobileSidebar}>
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold">{menuItems.find((i) => i.id === activeTab)?.title || 'Home'}</h1>
              <div className="ml-auto flex items-center gap-3">
                <QuotaIndicator />
                <UserButton afterSignOutUrl="/sign-in" />
              </div>
            </header>
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
          <ToastViewport />
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}
