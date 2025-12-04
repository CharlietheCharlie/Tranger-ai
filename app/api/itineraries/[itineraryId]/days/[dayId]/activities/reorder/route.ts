
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { dayId: string } }
) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session && !tempCreatorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { dayId } = params;
    const { activityIds } = await request.json();

    if (!Array.isArray(activityIds)) {
      return NextResponse.json({ message: 'Invalid input, activityIds must be an array' }, { status: 400 });
    }

    const updates = activityIds.map((id, index) =>
      prisma.activity.update({
        where: { id: id, dayId: dayId },
        data: { position: index },
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Activities reordered successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error reordering activities:', error);
    return NextResponse.json({ message: 'Error reordering activities', error }, { status: 500 });
  }
}
