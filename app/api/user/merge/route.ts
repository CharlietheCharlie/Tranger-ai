import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tempUserId } = await request.json();
    const realUserId = session.user.id;

    if (!tempUserId) {
      return NextResponse.json(
        { message: "tempUserId is required" },
        { status: 400 }
      );
    }

    // Update Itineraries
    await prisma.itinerary.updateMany({
      where: { tempCreatorId: tempUserId },
      data: {
        creatorId: realUserId,
        tempCreatorId: null,
      },
    });

    // 2. 同時把登入的 user 加入 collaborators
    const itinerariesToJoin = await prisma.itinerary.findMany({
      where: { creatorId: realUserId },
    });

    await prisma.collaborator.createMany({
      data: itinerariesToJoin.map((itin) => ({
        userId: realUserId,
        itineraryId: itin.id,
      })),
      skipDuplicates: true,
    });

    // Update Comments
    await prisma.comment.updateMany({
      where: { tempAuthorId: tempUserId },
      data: {
        authorId: realUserId,
        tempAuthorId: null,
      },
    });

    return NextResponse.json(
      { message: "Anonymous data merged successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error merging anonymous data:", error);
    return NextResponse.json(
      { message: "Error merging anonymous data", error },
      { status: 500 }
    );
  }
}
