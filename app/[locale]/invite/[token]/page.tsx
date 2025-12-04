import InviteClient from "./InviteClient";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const session = await auth();
  const { token } = await params;

  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/invite/${token}`);
  }

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: {
      itinerary: { include: { creator: true } },
    },
  });

  if (!invite) return <InviteClient status="error" />;

  const trip = invite.itinerary;

  return (
    <InviteClient
      status="ready"
      token={token}
      trip={{
        id: trip.id,
        name: trip.name,
        location: trip.destination,
        dates: `${trip.startDate.toISOString().slice(0, 10)} → ${trip.endDate
          .toISOString()
          .slice(0, 10)}`,
        imageUrl: trip.coverImage || "https://picsum.photos/600/300",
        inviter: {
          name: trip.creator?.name || "Someone",
          avatarUrl: trip.creator?.image || "https://i.pravatar.cc/100",
        },
      }}
    />
  );
}
