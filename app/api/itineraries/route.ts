import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    let whereClause: any = {};

    if (session?.user?.id) {
      whereClause = {
        OR: [
          { creatorId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      };
    } else if (tempCreatorId) {
      whereClause = { tempCreatorId };
    } else {
      return NextResponse.json([]); // Return empty array if no user or tempId
    }

    const itineraries = await prisma.itinerary.findMany({
      where: whereClause,
      include: {
        days: {
          include: {
            activities: true,
          },
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
        comments: true,
      },
      orderBy: {
        id: "asc", // Or some other meaningful order
      },
    });
    return NextResponse.json(itineraries);
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json(
      { message: "Error fetching itineraries", error },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth(); // Use the auth function to get the session
    const tempCreatorId = request.headers.get("x-temp-user-id");

    let creatorData: any = {};
    let collaboratorsConnect: any = {};

    if (session?.user?.id) {
      creatorData = { creator: { connect: { id: session.user.id } } };
      collaboratorsConnect = {
        create: [{ userId: session.user.id }]
      };
    } else if (tempCreatorId) {
      creatorData = { tempCreatorId: tempCreatorId };
      // Anonymous itineraries don't have collaborators initially
    } else {
      return NextResponse.json(
        { message: "Unauthorized: No user session or temporary ID provided" },
        { status: 401 }
      );
    }

    const { name, destination, startDate, endDate, days } =
      await request.json();

    const newItinerary = await prisma.itinerary.create({
      data: {
        name,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ...creatorData,
        collaborators: collaboratorsConnect,
        days: {
          create: days.map((day: any) => ({
            date: new Date(day.date),
            activities: {
              create: day.activities.map((activity: any) => ({
                title: activity.title,
                description: activity.description,
                startTime: activity.startTime,
                duration: activity.duration,
                location: activity.location,
                cost: activity.cost,
                tags: activity.tags,
                notes: activity.notes,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json(newItinerary, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    return NextResponse.json(
      { message: "Error creating itinerary", error },
      { status: 500 }
    );
  }
}
