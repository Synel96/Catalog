// hooks/useFeedSocket.js
import { useEffect, useRef } from "react";
import { useStreetStore } from "../store/useStreetStore";

export const useFeedSocket = () => {
  const socketRef = useRef(null);
  const fetchStreetPosts = useStreetStore((state) => state.fetchStreetPosts);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/feed/"); // vagy wss:// ha prod

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "post_update") {
        console.log("📨 New post received:", data);
        fetchStreetPosts(); // újratölti az utcai posztokat
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    socket.onerror = (error) => {
      console.error("❗ WebSocket error:", error);
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [fetchStreetPosts]);
};
