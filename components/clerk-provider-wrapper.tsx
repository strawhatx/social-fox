'use client';

import { ClerkProvider } from '@clerk/nextjs';

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
  publishableKey?: string;
}

export default function ClerkProviderWrapper({ 
  children, 
  publishableKey 
}: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}