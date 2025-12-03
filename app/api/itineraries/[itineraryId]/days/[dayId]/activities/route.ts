
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itineraryId: string; dayId: string }> }
) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session && !tempCreatorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { itineraryId, dayId } = await params;
    const { title, description, startTime, duration, location, cost, tags, notes } = await request.json();

    const newActivity = await prisma.activity.create({
      data: {
        title,
        description,
        startTime,
        duration,
        location,
        cost,
        tags,
        notes,
        day: {
          connect: { id: dayId },
        },
      },
    });

    return NextResponse.json(newActivity, { status: 201 });
  } catch (error) {
    console.error('Error adding activity:', error);
    return NextResponse.json({ message: 'Error adding activity', error }, { status: 500 });
  }
}
