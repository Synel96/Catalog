import { useEffect } from "react";
import { feedSocketUrl } from "@/components/site";

const RECONNECT_MS = 3000;

type FeedEvent = { type: "post_update"; message: string; overlord: number; post_id: number };

// Subscribes to the backend's feed websocket and calls `onPostUpdate`
// whenever someone posts. Reconnects after drops while mounted.
export function useFeedSocket(onPostUpdate: (event: FeedEvent) => void) {
  useEffect(() => {
    let socket: WebSocket | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      socket = new WebSocket(feedSocketUrl());
      socket.onmessage = (message) => {
        try {
          const data = JSON.parse(String(message.data)) as FeedEvent;
          if (data.type === "post_update") onPostUpdate(data);
        } catch {
          // Ignore anything that isn't a feed event.
        }
      };
      socket.onclose = () => {
        if (!closed) retry = setTimeout(connect, RECONNECT_MS);
      };
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      socket?.close();
    };
  }, [onPostUpdate]);
}
