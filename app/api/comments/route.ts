import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session?.user?.id && !tempCreatorId) {
      return NextResponse.json(
        { message: "Unauthorized: User not authenticated" },
        { status: 401 }
      );
    }

    const { itineraryId, text, activityId, imageUrl } = await request.json();

    const newComment = await prisma.comment.create({
      data: {
        text,
        authorId: session?.user?.id || null,
        tempAuthorId: tempCreatorId || null,
        activityId,
        itineraryId,
        imageUrl,
      },
    });

    // ========== call socket ==========
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (socketUrl) {
      fetch(`${socketUrl}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new-message",
          itineraryId,
          payload: newComment,
        }),
      }).catch((err) => console.error("Socket broadcast error:", err));
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { message: "Error adding comment", error },
      { status: 500 }
    );
  }
}
