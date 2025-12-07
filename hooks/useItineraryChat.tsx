"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";

export function useItineraryChat(itineraryId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!itineraryId) return;

    const socket = getSocket();

    // ===== 加入房間 =====
    socket.emit("join-room", itineraryId);

    // ===== 處理新訊息 =====
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

    // ===== 離開房間 + 清除事件 =====
    return () => {
      socket.emit("leave-room", itineraryId);
      socket.off("new-message", handler);
    };
  }, [itineraryId, queryClient]);
}
