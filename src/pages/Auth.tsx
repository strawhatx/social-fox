import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SEOHead from '@/components/SEOHead';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const { signUp, signIn, user, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  // Get plan info from router state
  const returnTo = location.state?.returnTo || '/dashboard';

  // Open on specific tab when requested (e.g., from "Join the Beta")
  useEffect(() => {
    const openTab = location.state?.openTab as 'signin' | 'signup' | undefined;
    if (openTab) {
      setActiveTab(openTab);
    }
  }, [location.state]);

  // Handle authenticated users
  useEffect(() => {
    if (user) {
      // Just redirect to dashboard - subscription handled by Edge Function
      navigate(returnTo);
    }
  }, [user, navigate, returnTo]);


  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    // Basic client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsLoading(false);
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setIsLoading(false);
      setError('Password must be at least 6 characters.');
      return;
    }

    // Create account - Edge Function will handle free subscription setup
    const { error } = await signUp(email, password, {
      full_name: fullName
    });

    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account. You can now sign in.",
      });
      // Redirect to login tab after successful signup
      setActiveTab('signin');
    }

    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Basic client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsLoading(false);
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setIsLoading(false);
      setError('Please enter your password.');
      return;
    }

    const { error } = await signIn(email, password);


    if (error) {
      //if the error is because the email is not confirmed, resend the confirmation link
      if (error.message.includes("Email not confirmed")) {
        // Trigger resend here
        const { error } = await resendConfirmation(email);

        if (error) {
          setError(error.message);
        }
        else {
          setError("Email not confirmed. Please check your email for the new confirmation link.");
        }
      }
      else // catchall for other errors
        setError(error.message);
    }

    // Successful sign in will trigger useEffect to handle navigation

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center p-4">
      <SEOHead pageKey="auth" />
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            className="h-12 w-12 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              Social Fox
            </h1>
            <p className="text-gray-600">
              Sign in to your Socialfox account
            </p>
          </div>
        </div>

        <Card className="card-modern">
          <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl transform -rotate-3">
                <img src="/fox-logo.png" alt="Fox Logo" className="w-8 h-8" />
              </div>
            </div>
          </div>
            <CardTitle className="text-2xl">Authentication</CardTitle>
            <CardDescription className="text-base">
            Welcome! Let’s turn your GitHub commits into posts for Twitter & LinkedIn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-gray-100">
                <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-gray-700">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;