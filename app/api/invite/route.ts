import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const { itineraryId } = await req.json();
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = randomBytes(32).toString("hex");

  await prisma.inviteToken.create({
    data: {
      token,
      itineraryId,
      inviterId: session.user.id,
      email: session.user.email,
    },
  });

  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;

  return Response.json({ inviteUrl });
}
