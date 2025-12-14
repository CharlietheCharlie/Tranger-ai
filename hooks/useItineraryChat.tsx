"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";

export function useItineraryChat(itineraryId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!itineraryId) return;

    const socket = getSocket();

    const handleJoinRoom = () => {
      console.log("Joining room:", itineraryId);
      socket.emit("join-room", itineraryId);
    };

    // Join immediately if connected
    if (socket.connected) {
      handleJoinRoom();
    }

    // Re-join on reconnect
    socket.on("connect", handleJoinRoom);

    // Debug connection errors
    socket.on("connect_error", (err: any) => {
      console.error("Socket connection error:", err);
    });

    // Handle new message
    const handler = (newMessage: any) => {
      console.log("Received new message via socket:", newMessage);
      queryClient.setQueryData(
        ["comments", itineraryId],
        (old: any[] | undefined) => {
          if (!old) return [newMessage];

          if (old.some((m) => m.id === newMessage.id)) return old;

          return [...old, newMessage];
        }
      );
    };

    socket.on("new-message", handler);

    // Leave room and cleanup
    return () => {
      socket.emit("leave-room", itineraryId);
      socket.off("connect", handleJoinRoom);
      socket.off("new-message", handler);
      socket.off("connect_error");
    };
  }, [itineraryId, queryClient]);
}
