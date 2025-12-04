// app/api/invite/accept/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const { token } = await req.json();
  const session = await auth();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 找到邀請
  const invite = await prisma.inviteToken.findUnique({
    where: { token },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
  }

  const userId = session.user.id;
  const itineraryId = invite.itineraryId;

  // 使用 upsert 解決 “已加入” 的問題
  await prisma.collaborator.upsert({
    where: {
      userId_itineraryId: {
        userId,
        itineraryId,
      },
    },
    update: {}, // 如果已存在，什麼都不做
    create: {
      userId,
      itineraryId,
    },
  });

  // 刪掉 token（避免二次點擊）
  await prisma.inviteToken.delete({
    where: { token },
  });

  return NextResponse.json({ ok: true });
}
