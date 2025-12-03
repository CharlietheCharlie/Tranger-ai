
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: Request,
) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session && !tempCreatorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const activityId = url.pathname.split('/').pop() || '';
    const { title, description, startTime, duration, location, cost, tags, notes, dayId } = await request.json();

    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: {
        title,
        description,
        startTime,
        duration,
        location,
        cost,
        tags,
        notes,
        ...(dayId && { day: { connect: { id: dayId } } }), // Connect to new day if dayId is provided
      },
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({ message: 'Error updating activity', error }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session && !tempCreatorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const activityId = url.pathname.split('/').pop() || '';

    await prisma.activity.delete({
      where: { id: activityId },
    });

    return NextResponse.json({ message: 'Activity deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json({ message: 'Error deleting activity', error }, { status: 500 });
  }
}
