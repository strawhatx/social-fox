import { useEffect, useRef, useState, useCallback } from "react";

export type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  status?: "pending" | "done" | "error";
};

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  // Connect WebSocket for real-time updates
  useEffect(() => {
    if (!conversationId) return;

    const connect = () => {
      const ws = new WebSocket(
        `wss://axbuqwnm4f.execute-api.us-east-1.amazonaws.com/prod?conversationId=${conversationId}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS Connected");
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.conversationId !== conversationId) return;

          setMessages((prev) => {
            const updated = [...prev];
            (data.messages || []).forEach((m: ChatMessage) => {
              const idx = updated.findIndex((x) => x.id === m.id);
              if (idx >= 0) updated[idx] = { ...updated[idx], ...m };
              else updated.push({
                ...m,
                timestamp: new Date(m.timestamp || Date.now()),
              });
            });

            return updated.sort(
              (a, b) =>
                new Date(a.timestamp || 0).getTime() -
                new Date(b.timestamp || 0).getTime()
            );
          });
        } catch (err) {
          console.warn("WS parse error:", event.data);
        }
      };

      ws.onclose = () => {
        console.log("❌ WS Disconnected — retrying...");
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error("⚠️ WS error", err);
        ws.close();
      };
    };

    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [conversationId]);

  // Load conversation history on mount
  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`/api/conversations/${conversationId}`);
        if (!resp.ok) return;
        const data = await resp.json();

        const formatted = (data.messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          status: msg.status,
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("❌ Failed to load conversation:", err);
      }
    };
    load();
  }, [conversationId]);

   // Send a new message
   const sendWSMessage = (messageId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ 
          action: "sendMessage", 
          conversationId,
          messageId: messageId,
        })
      );
    } 
  };

  // Send user message -> call API instead of WS
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        const resp = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content }),
        });

        if (!resp.ok) {
          throw new Error("Failed to send message");
        }

        const data = await resp.json();

        // API returns the inserted user + assistant (pending) messages
        setMessages((prev) => {
          const updated = [...prev, ...data.messages];
          return updated.sort(
            (a, b) =>
              new Date(a.timestamp || 0).getTime() -
              new Date(b.timestamp || 0).getTime()
          );
        });
        // should only be 2 per call the user message and the pending assistant message
        const pendingMessage = data.messages.find((m: ChatMessage) => m.status === "pending");

        sendWSMessage(pendingMessage.id);
      } catch (err) {
        console.error("❌ sendMessage failed", err);
      }
    },
    [conversationId]
  );

  // Retry assistant message
  const retryMessage = useCallback(
    async (failedMessage: ChatMessage) => {
      if (!failedMessage.id || failedMessage.role !== "assistant") return;

      try {
        const resp = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            retry: true,
            messageId: failedMessage.id,
          }),
        });

        if (!resp.ok) throw new Error("Retry failed");

        sendWSMessage(failedMessage.id);
      } catch (err) {
        console.error("❌ retryMessage failed", err);
      }
    },
    [conversationId]
  );

  return { messages, sendMessage, retryMessage, connected };
}
