import { useEffect } from "react";
import { API_MOCKS, feedSocketUrl, MOCK_FEED_EVENT } from "@/components/site";

const RECONNECT_MS = 3000;

export type FeedEvent = {
  type: "post_update";
  message: string;
  overlord: number;
  post_id: number;
};

// Calls `onPostUpdate` whenever someone posts: from the backend's feed
// websocket, or in mock mode from the mock backend's window event.
// Reconnects after drops while mounted.
export function useFeedSocket(onPostUpdate: (event: FeedEvent) => void) {
  useEffect(() => {
    if (API_MOCKS) {
      const listener = (event: Event) => onPostUpdate((event as CustomEvent<FeedEvent>).detail);
      window.addEventListener(MOCK_FEED_EVENT, listener);
      return () => window.removeEventListener(MOCK_FEED_EVENT, listener);
    }

    let socket: WebSocket | undefined;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      try {
        socket = new WebSocket(feedSocketUrl());
      } catch (error) {
        // e.g. blocked by the CSP: live updates are a nicety, the feed
        // still works without them.
        console.error("Feed socket unavailable:", error);
        return;
      }
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
