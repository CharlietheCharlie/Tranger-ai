
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session && !tempCreatorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { activityId } = await params;
    const { targetDayId, position } = await request.json();

    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
    });

    if (!activity) {
        return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
    }

    const sourceDayId = activity.dayId;
    const oldPosition = activity.position;

    await prisma.$transaction(async (tx) => {
        // Remove from old position in source day
        await tx.activity.updateMany({
            where: {
                dayId: sourceDayId,
                position: { gt: oldPosition },
            },
            data: {
                position: { decrement: 1 },
            },
        });

        // Make space in new position in target day
        await tx.activity.updateMany({
            where: {
                dayId: targetDayId,
                position: { gte: position },
            },
            data: {
                position: { increment: 1 },
            },
        });

        // Update the activity's day and position
        await tx.activity.update({
            where: { id: activityId },
            data: {
                dayId: targetDayId,
                position: position,
            },
        });
    });

    return NextResponse.json({ message: 'Activity moved successfully' });
  } catch (error) {
    console.error('Error moving activity:', error);
    return NextResponse.json({ message: 'Error moving activity', error }, { status: 500 });
  }
}
