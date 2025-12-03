import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { addDays } from 'date-fns';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itineraryId: string }> }
) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get("x-temp-user-id");
    if (!session?.user?.id && !tempCreatorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { itineraryId } = await params;
    const { orderedDayIds } = await request.json();

    // 1. 先抓行程的 startDate（或整個 itinerary）
    const itinerary = await prisma.itinerary.findUnique({
      where: { id: itineraryId },
      select: { startDate: true },
    });

    if (!itinerary || !itinerary.startDate) {
      return NextResponse.json({ message: 'Itinerary not found or missing startDate' }, { status: 404 });
    }

    const startDate = new Date(itinerary.startDate);

    // 2. 依照新順序，更新 position + date
    const transaction = orderedDayIds.map((dayId: string, index: number) => {
      const newDate = addDays(startDate, index);

      return prisma.day.update({
        where: { id: dayId, itineraryId },
        data: {
          position: index,
          date: newDate, // ← 更新日期
        },
      });
    });

    await prisma.$transaction(transaction);

    return NextResponse.json({ message: 'Days reordered & dates updated' }, { status: 200 });
  } catch (error) {
    console.error('Error reordering days:', error);
    return NextResponse.json({ message: 'Error reordering days', error }, { status: 500 });
  }
}
