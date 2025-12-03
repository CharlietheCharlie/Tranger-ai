import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itineraryId: string }> }
) {
  try {
    const { itineraryId } = await params;

    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      include: {
        days: {
          include: {
            activities: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          }
        },
      },
    });

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    return NextResponse.json(
      { message: "Error fetching itinerary", error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itineraryId: string }> }
) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session && !tempCreatorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { itineraryId } = await params;
    const { name, destination, startDate, endDate, coverImage, days } =
      await request.json();

    const updatedItinerary = await prisma.itinerary.update({
      where: { id: itineraryId },
      data: {
        name,
        destination,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        coverImage,
        ...(days && {
          days: {
            deleteMany: { itineraryId }, // 清掉舊的 days
            create: days.map((day: any) => ({
              date: new Date(day.date),
              position: day.position ?? 0,
              activities: {
                create: (day.activities ?? []).map((a: any) => ({
                  title: a.title,
                  description: a.description,
                  startTime: a.startTime,
                  duration: a.duration,
                  location: a.location,
                  cost: a.cost,
                  tags: a.tags,
                  notes: a.notes,
                })),
              },
            })),
          },
        }),
      },
    });
    return NextResponse.json(updatedItinerary);
  } catch (error) {
    console.error("Error updating itinerary:", error);
    return NextResponse.json(
      { message: "Error updating itinerary", error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itineraryId: string }> }
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {itineraryId }= await params;
    await prisma.itinerary.delete({
      where: { id: itineraryId },
    });

    return NextResponse.json(
      { message: "Itinerary deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return NextResponse.json(
      { message: "Error deleting itinerary", error },
      { status: 500 }
    );
  }
}
