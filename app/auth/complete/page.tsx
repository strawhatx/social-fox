"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

function AuthCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const run = async () => {

      const event = searchParams.get('event') || 'unknown';
      if (!isLoaded || !user) return;

      console.log('event', event);
      console.log('user', user);

      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: event,
            userId: user.id
          }),
        });
      } catch (e) {
        // ignore errors to avoid blocking redirect
        console.error(e);
      } finally {
        router.replace('/calendar');
      }
    };
    run();
  }, [isLoaded, user, router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <p className="text-muted-foreground">Finalizing authentication…</p>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6"><p className="text-muted-foreground">Loading…</p></div>}>
      <AuthCompleteInner />
    </Suspense>
  );
}


