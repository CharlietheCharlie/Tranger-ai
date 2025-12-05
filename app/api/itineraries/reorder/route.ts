
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const tempCreatorId = request.headers.get('x-temp-user-id');

    if (!session?.user?.id && !tempCreatorId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { orderedItineraryIds } = await request.json(); // Expects an array of itinerary IDs in the new order

    const transaction = orderedItineraryIds.map((itineraryId: string, index: number) =>
      prisma.itinerary.update({
        where: { id: itineraryId },
        data: {
          position: index, // Set the position based on the array index
        },
      })
    );

    await prisma.$transaction(transaction);

    return NextResponse.json({ message: 'Itineraries reordered successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error reordering itineraries:', error);
    return NextResponse.json({ message: 'Error reordering itineraries', error }, { status: 500 });
  }
}
