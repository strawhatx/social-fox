"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ConversationContextType {
  initialMessage: string | null;
  setInitialMessage: (message: string | null) => void;
  clearInitialMessage: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const clearInitialMessage = () => setInitialMessage(null);

  return (
    <ConversationContext.Provider value={{
      initialMessage,
      setInitialMessage,
      clearInitialMessage
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
}
