import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import ProjectWorkspacePage from "./pages/ProjectWorkspace";
import WizardLayout from "@/pages/create-project/WizardLayout";
import Step1Basics from "@/pages/create-project/Step1Basics";
import Step2Voice from "@/pages/create-project/Step2Voice";
import Step3GitHub from "@/pages/create-project/Step3GitHub";
import Step4Confirm from "@/pages/create-project/Step4Confirm";
import Step5Finalize from "./pages/create-project/Step5Finalize";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
                  <Index />
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
            <Route 
              path="/create-project/*" 
              element={
                <ProtectedRoute>
                  <WizardLayout />
                </ProtectedRoute>
              }
            >
              <Route path=":projectId" element={<Step1Basics />} />
              <Route path=":projectId/brand" element={<Step2Voice />} />
              <Route path=":projectId/github" element={<Step3GitHub />} />
              <Route path=":projectId/style" element={<Step4Confirm />} />
              <Route path=":projectId/finalize" element={<Step5Finalize />} />
            </Route>
            <Route 
              path="/project/:projectId" 
              element={
                <ProtectedRoute>
                  <ProjectWorkspacePage />
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
);

export default App;
