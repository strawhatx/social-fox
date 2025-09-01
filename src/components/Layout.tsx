
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { ToastProvider } from "./ui/toast";


// Sidebar component
export function Sidebar({ menuItems, activeTab, onTabChange, isMobileSidebarOpen, setIsMobileSidebarOpen }: {
  menuItems: any[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      {/* Mini Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-16 bg-sidebar border-r border-sidebar-border 
        flex flex-col items-center py-6 z-30 mini-sidebar shadow-lg
        transition-transform duration-200 ease-in-out
        md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-8 shadow-lg hover:shadow-xl transition-shadow duration-200 cursor-pointer">
          <span className="text-white font-bold">SF</span>
        </div>
        {/* Navigation Items */}
        <nav className="flex flex-col gap-4 flex-1 w-full px-2">
          {menuItems.map((item) => (
            <Tooltip key={item.id} delayDuration={150}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`
                    w-full h-12 rounded-xl flex items-center justify-center text-2xl
                    transition-all duration-200 relative group cursor-pointer
                    hover:shadow-md active:scale-95
                    ${activeTab === item.id 
                      ? `${item.color.split(' ')[0]} bg-current bg-opacity-15 scale-105 shadow-lg` 
                      : `text-muted-foreground hover:scale-105 ${item.color} hover:shadow-sm`
                    }
                  `}
                >
                  <span className="group-hover:scale-110 transition-transform duration-150">
                    {item.icon}
                  </span>
                </button>
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

// SidebarLayout component
export default function SidebarLayout({ children, menuItems, initialTab = "home" }: {
  children: React.ReactNode;
  menuItems: any[];
  initialTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar
          menuItems={menuItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden md:ml-16">
          <header className="border-b border-border p-4 flex items-center gap-4 bg-background">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden w-10 h-10 p-0"
              onClick={toggleMobileSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">
              {menuItems.find(item => item.id === activeTab)?.title || "Home"}
            </h1>
          </header>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
        <ToastProvider />
      </div>
    </TooltipProvider>
  );
}