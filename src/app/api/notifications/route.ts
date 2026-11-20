import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true } });
  return profile?.status === "ACTIVE" ? user : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  return NextResponse.json({ notifications, unread });
}

export async function PATCH(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.markAll === true) {
    await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  } else if (typeof body.id === "string") {
    await prisma.notification.updateMany({ where: { id: body.id, userId: user.id, readAt: null }, data: { readAt: new Date() } });
  } else return NextResponse.json({ error: "Notification invalide." }, { status: 400 });
  return NextResponse.json({ success: true });
}
