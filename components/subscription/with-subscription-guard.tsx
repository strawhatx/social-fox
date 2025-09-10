"use client";

import SubscriptionGuard from './subscription-guard';

export function withSubscriptionGuard<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <SubscriptionGuard fallback={fallback}>
        <Component {...props} />
      </SubscriptionGuard>
    );
  };
}

export default withSubscriptionGuard;
