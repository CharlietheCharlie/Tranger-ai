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
    const handler = (msg: any) => {
      queryClient.setQueryData(["comments", itineraryId], (old = []) => {
        return [...old, msg];
      });
    };

    socket.on("new-message", handler);

    // ===== 離開房間 + 清除事件 =====
    return () => {
      socket.emit("leave-room", itineraryId);
      socket.off("new-message", handler);
    };
  }, [itineraryId, queryClient]);
}
