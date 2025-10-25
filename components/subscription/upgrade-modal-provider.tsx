"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Crown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { getPriceId } from '@/lib/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

interface UpgradeModalContextValue {
  showUpgrade: (reason?: string) => void;
  hideUpgrade: () => void;
}

const UpgradeModalContext = createContext<UpgradeModalContextValue | null>(null);

export function useUpgradeModal(): UpgradeModalContextValue {
  const ctx = useContext(UpgradeModalContext);
  if (!ctx) {
    throw new Error('useUpgradeModal must be used within UpgradeModalProvider');
  }
  return ctx;
}

export default function UpgradeModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const { user } = useUser();

  // Only attach once
  const installedRef = useRef(false);

  const showUpgrade = useCallback((why?: string) => {
    setReason(why);
    setOpen(true);
  }, []);

  const hideUpgrade = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (installedRef.current) return;
    installedRef.current = true;

    const originalFetch = window.fetch.bind(window);

    async function wrappedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const response = await originalFetch(input, init);

      try {
        // Server signals upgrade required in either status 402 or header
        const upgradeHeader = response.headers.get('x-upgrade-required');
        if (response.status === 402 || upgradeHeader === 'true') {
          let why: string | undefined = undefined;
          try {
            const cloned = response.clone();
            const data = await cloned.json().catch(() => null);
            if (data && (data.error || data.reason)) {
              why = data.error || data.reason;
            }
          } catch {}
          showUpgrade(why);
        }
      } catch {}

      return response;
    }

    // assignable at runtime
    window.fetch = wrappedFetch;

    return () => {
      // restore on unmount
      window.fetch = originalFetch;
    };
  }, [showUpgrade]);

  const handleUpgrade = useCallback((planId: 'launch' | 'grow' | 'scale') => {
    const priceId = getPriceId(planId);
    if (!priceId) return;

    // Create Stripe checkout session
    fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })
    .then(response => response.json())
    .then(({ url }) => {
      if (url) window.location.href = url;
    })
    .catch(error => {
      console.error('Error creating checkout session:', error);
    });
  }, []);

  const value = useMemo(() => ({ showUpgrade, hideUpgrade }), [showUpgrade, hideUpgrade]);

  return (
    <UpgradeModalContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-blue-50 to-orange-50 border-orange-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-700">
              <Crown className="h-5 w-5" />
              Upgrade to continue
            </DialogTitle>
            {reason && (
              <DialogDescription className="text-orange-600">
                {reason}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-3">
            {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
              <Card 
                key={plan.id} 
                className={`${
                  plan.popular 
                    ? 'border-orange-300 bg-orange-50' 
                    : 'border-orange-200'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    {plan.popular && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        Popular
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold text-orange-600">${plan.price}</span>
                    <span className="text-orange-500">/{plan.interval}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={() => handleUpgrade(plan.action as 'launch' | 'grow' | 'scale')} 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </UpgradeModalContext.Provider>
  );
}


