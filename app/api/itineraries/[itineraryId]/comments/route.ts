import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itineraryId: string }> }
) {
  const session = await auth();
  const tempCreatorId = request.headers.get('x-temp-user-id');
  if (!session?.user?.id && !tempCreatorId) {
    return NextResponse.json(
      { message: 'Unauthorized: User not authenticated' },
      { status: 401 }
    );
  }
  const { itineraryId } = await params;
  // First, verify the user has access to the itinerary
  const itinerary = await prisma.itinerary.findUnique({
    where: {
      id: itineraryId,
      OR: [
        { creatorId: session?.user?.id || undefined },
        { tempCreatorId: tempCreatorId || undefined },
        ...(session?.user?.id
          ? [{ collaborators: { some: { userId: session.user.id } } }]
          : []),
      ],
    },
    select: { id: true }, // We only need to check for existence
  });

  if (!itinerary) {
    return NextResponse.json({ error: 'Itinerary not found or you do not have access' }, { status: 404 });
  }

  // If user has access, fetch the comments
  const comments = await prisma.comment.findMany({
    where: {
      itineraryId: itineraryId,
    },
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return NextResponse.json(comments);
}
