import { NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";
import prisma from "@/lib/prisma";

export const config = {
  runtime: "nodejs",
};

let io: IOServer | null = null;

export default function handler(_req: any, res: NextResponse) {
  if (!io) {
    io = new IOServer(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("User Connected", socket.id);

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId);
      });

      socket.on("send-message", async ({ itineraryId, text, user }) => {
        // 1. Save message
        const comment = await prisma.comment.create({
          data: {
            text,
            itineraryId,
            authorId: user.id,
          },
          include: { author: true },
        });

        // 2. Broadcast to room
        io?.to(`itinerary:${itineraryId}`).emit("new-message", comment);
      });
    });
  }

  res.end();
}
