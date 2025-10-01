"use client";

import { MessageContent } from "@/lib/copilot";
import { useEffect, useState, useCallback, useRef } from "react";

export type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: MessageContent;
  timestamp?: Date;
  status?: "pending" | "done" | "error" | "failed"; // For UI state only
};

export function useChat(conversationId: string) {
  // === STATE ===
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(true);
  const hasRun = useRef(false);
  const [conversationTitle, setConversationTitle] = useState<string>("");

  // === UTILITY FUNCTIONS ===
  const mergeMessages = useCallback(
    (incoming: ChatMessage[]) =>
      setMessages((prev: ChatMessage[]) => {
        const updated = [...prev];
        for (const msg of incoming) {
          const idx = updated.findIndex((x) => x.id === msg.id);
          if (idx >= 0) updated[idx] = { ...updated[idx], ...msg };
          else
            updated.push({
              ...msg,
              timestamp: new Date(msg.timestamp || Date.now()),
            });
        }
        return updated.sort(
          (a, b) =>
            new Date(a.timestamp || 0).getTime() -
            new Date(b.timestamp || 0).getTime()
        );
      }),
    []
  );

  const processAIMessage = useCallback(
    async (messageId: string) => {
      try {
        console.log("🤖 Processing AI message:", messageId);
        const resp = await fetch("/api/messages/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, messageId }),
        });
        
        if (resp.ok) {
          const data = await resp.json();
          mergeMessages([data]);
        } else {
          console.error("❌ Failed to process AI message");
          // Mark message as error
          mergeMessages([{
            id: messageId,
            role: "assistant",
            content: { text: "Failed to generate message." },
            status: "error"
          }]);
        }
      } catch (err) {
        console.error("❌ Error processing AI message:", err);
        // Mark message as error
        mergeMessages([{
          id: messageId,
          role: "assistant",
          content: { text: "Failed to generate message." },
          status: "error"
        }]);
      }
    },
    [conversationId, mergeMessages]
  );

  // === CONNECTION MANAGEMENT ===
  useEffect(() => {
    if (!conversationId) return;
    
    // Set connected to true since we're using direct API calls
    setConnected(true);
  }, [conversationId]);

  // === CONVERSATION RECOVERY ===
  const checkAndResendIncomplete = useCallback(
    async (messages: ChatMessage[]) => {
      if (messages.length === 0) return;

      const lastMessage = messages[messages.length - 1];

      switch (lastMessage.role) {
        case "assistant":
          if (lastMessage.status === "pending" && lastMessage.id) {
            console.log("🔄 Resending pending AI response");
            processAIMessage(lastMessage.id);
          }
          break;

        case "user":
          // Check if there's already a pending assistant message
          const hasPendingAssistant = messages.some(m => m.role === "assistant" && m.status === "pending");
          
          if (!hasPendingAssistant) {
            console.log("🔄 Creating pending AI response for user message");
            try {
              const resp = await fetch("/api/messages/resend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId }),
              });

              if (resp.ok) {
                const data = await resp.json();
                mergeMessages(data.messages);
                const pending = data.messages.find((m: ChatMessage) => m.status === "pending");
                if (pending?.id) processAIMessage(pending.id);
              }
            } catch (err) {
              console.error("❌ Failed to create pending AI response:", err);
            }
          }
          break;
      }
    },
    [conversationId, mergeMessages, processAIMessage]
  );

  // === DATA LOADING ===
  useEffect(() => { 
    if (hasRun.current) return;

    const loadHistory = async () => {
      try {
        const resp = await fetch(`/api/conversations/${conversationId}`);
        if (!resp.ok) return;
        
        const data = await resp.json();
        if (data?.title) setConversationTitle(data.title);
        const formatted: ChatMessage[] = (data.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: typeof m.content === 'string' 
            ? { text: m.content }
            : m.content,
          timestamp: new Date(m.createdAt),
          status: m.status,
        }));
        
        setMessages(formatted);
        hasRun.current = true;
        await checkAndResendIncomplete(formatted);
      } catch (err) {
        console.error("❌ Failed to load conversation:", err);
      }
    };
    
    if (conversationId && !hasRun.current) loadHistory();
  }, [conversationId]);

  // === API FUNCTIONS ===
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        const resp = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content }),
        });
        if (!resp.ok) throw new Error("Failed to send message");

        const data = await resp.json();
        mergeMessages(data.messages);

        const pending = data.messages.find((m: ChatMessage) => m.status === "pending");
        if (pending?.id) processAIMessage(pending.id);
      } catch (err) {
        console.error("❌ sendMessage failed", err);
      }
    },
    [conversationId, mergeMessages, processAIMessage]
  );

  const retryMessage = useCallback(
    async (failed: ChatMessage) => {
      if (!failed.id || failed.role !== "assistant") return;

      try {
        const resp = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            retry: true,
            messageId: failed.id,
          }),
        });
        if (!resp.ok) throw new Error("Retry failed");

        processAIMessage(failed.id);
      } catch (err) {
        console.error("❌ retryMessage failed", err);
      }
    },
    [conversationId, processAIMessage]
  );

  return { 
    messages, 
    sendMessage, 
    retryMessage, 
    connected,
    conversationTitle
  };
}
