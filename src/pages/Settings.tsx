import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, User, CreditCard, ExternalLink, Zap } from 'lucide-react';
import { createStripeUrl, createCustomerPortalUrl, STRIPE_URLS } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth } from '@/lib/api';
import SEOHead from '@/components/SEOHead';



interface UserCredits {
  credits: number;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile: user_profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { toast: shadToast } = useToast();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const isPro = user_profile?.subscription_plan === 'pro';
  const hasStripeCustomer = user_profile?.stripe_customer_id;

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setCredits(data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || profileLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/30">
      <SEOHead pageKey="settings" />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-gray-600">Manage your profile and subscription</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user_profile?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <Button
                onClick={updateProfile}
                disabled={updating}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Credits & Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credits & Subscription
              </CardTitle>
              <CardDescription>
                Manage your credits and subscription plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border">
                <div>
                  <h3 className="font-semibold">Available Credits</h3>
                  <p className="text-sm text-muted-foreground">Use credits to generate content</p>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {credits?.credits || 0}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                {/* Current Plan Status */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Current Plan</h3>
                      <p className="text-sm text-muted-foreground">
                        {user_profile?.subscription_plan} {user_profile?.subscription_credits_per_month ? `- ${user_profile?.subscription_credits_per_month} credits/month` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{user_profile?.subscription_price_display}</div>
                      <div className="text-sm text-muted-foreground">{user_profile?.subscription_is_active ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Portal Access / Plan Selection */}
                {hasStripeCustomer ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(createCustomerPortalUrl(user?.email!), '_blank')}
                  >
                    Manage Billing & Subscriptions
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={async () => {
                        try {
                          const { data, error } = await fetchWithAuth('create-free-subscription', { method: 'POST' });
                          if (error) throw new Error(error.message || 'Failed to activate free plan');
                          shadToast({
                            title: 'Free plan activated',
                            description: 'Your free subscription has been created. It may take a moment to reflect.',
                          });
                          await refetchProfile();
                        } catch (e) {
                          console.error(e);
                          shadToast({
                            title: 'Error',
                            description: e instanceof Error ? e.message : 'Unable to activate free plan',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <span>Get Free Plan</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      className="w-full justify-between"
                      onClick={() => window.open(createStripeUrl('PRO_SUBSCRIPTION', user?.id!, user?.email!), '_blank')}
                    >
                      <span>Upgrade to Pro</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                <Separator />

                {/* Credit Top-up */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Additional Credits</h3>
                  {!isPro && (
                    <p className="text-sm text-muted-foreground">Top-ups are available on the Pro plan.</p>
                  )}

                  <Button
                    variant="outline"
                    className="w-full justify-between h-auto p-4"
                    onClick={() => window.open(createStripeUrl('BUY_CREDITS', user?.id!, user?.email!), '_blank')}
                    disabled={!isPro}
                    title={!isPro ? 'Top-ups are available on the Pro plan' : undefined}
                  >
                    <div className="text-left">
                      <div className="font-semibold">Credit Top-up</div>
                      <div className="text-sm text-muted-foreground">50 credits (one-time purchase)</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">$5</span>
                      <ExternalLink className="h-4 w-4" />
                    </div>
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    All purchases are processed securely through Stripe
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;