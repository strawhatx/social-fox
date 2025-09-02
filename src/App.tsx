import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import SidebarLayout from "./components/Layout";
import TweetBuilder from "./features/tweet-builder/Index";
import DashboardPage from "./pages/Dashboard";
import TweetBuilderPage from "./pages/TweetBuilder";
import SchedulerPage from "./pages/Scheduler";
import ConversationsPage from "./pages/Conversations";
import CommunityPage from "./pages/Community";
import OutreachPage from "./pages/Outreach";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <DashboardPage />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tweet-builder"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <TweetBuilderPage />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/conversations"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <ConversationsPage />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <CommunityPage />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

               <Route
                path="/outreach"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <OutreachPage />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/scheduler"
                element={
                  <ProtectedRoute>
                    <SidebarLayout>
                      <SchedulerPage />
                    </SidebarLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route path="/:provider/callback" element={<OAuthCallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
