"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken, clearAuthToken } from "./auth";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

// Messages are loosely shaped on purpose. Each page narrows the fields it uses.
export type SocketMessage = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

// Connects to the realtime server for one board and reconnects when it drops.
// The handler always sees the latest page state through a ref.
export function useBoardSocket(
  boardId: string,
  onMessage: (message: SocketMessage) => void
) {
  const router = useRouter();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      router.push("/login");
      return;
    }

    let socket: WebSocket | null = null;
    let stopped = false;
    let attempts = 0;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (stopped) return;

      socket = new WebSocket(`${WS_URL}?token=${encodeURIComponent(token)}`);
      setWs(socket);

      socket.onopen = () => {
        attempts = 0;
        setIsOffline(false);
        socket?.send(JSON.stringify({ type: "join", boardID: boardId }));
      };

      socket.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data));
        } catch (error) {
          console.error("Bad WebSocket message:", error);
        }
      };

      socket.onclose = (event) => {
        setWs(null);

        if (stopped) return;

        // 1008 means the server rejected the token. Retrying cannot help.
        if (event.code === 1008) {
          clearAuthToken();
          router.push("/login");
          return;
        }

        setIsOffline(true);

        // Retry quickly at first, then back off to once every 5 seconds.
        attempts += 1;
        retryTimer = setTimeout(connect, Math.min(1000 * attempts, 5000));
      };
    };

    connect();

    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, [boardId, router]);

  return { ws, isOffline };
}
