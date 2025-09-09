"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function AuthCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const run = async () => {
      const event = searchParams.get('event') || 'unknown';
      if (!isLoaded || !user) return;
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: event,
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress ?? null,
          }),
        });
      } catch (e) {
        // ignore errors to avoid blocking redirect
      } finally {
        router.replace('/tweet-builder');
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


