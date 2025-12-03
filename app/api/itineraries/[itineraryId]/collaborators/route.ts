
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
  request: Request,
) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const itineraryId = url.pathname.split('/').pop() || '';
    const { email } = await request.json();

    // Find the user by email
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create them (or link if they sign up later)
    // For simplicity, we'll create a basic user here. In a real app,
    // you might want to send an invitation or ensure the user signs up first.
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Basic name from email
          // Other fields can be set to defaults or null
        },
      });
    }

    // Connect the user as a collaborator to the itinerary
    const updatedItinerary = await prisma.itinerary.update({
      where: { id: itineraryId },
      data: {
        collaborators: {
          create: { userId: user.id },
        },
      },
      include: {
        collaborators: true, // Return updated collaborators list
      },
    });

    return NextResponse.json(updatedItinerary.collaborators, { status: 200 });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    return NextResponse.json({ message: 'Error adding collaborator', error }, { status: 500 });
  }
}
