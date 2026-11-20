import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProfile } from "@/lib/auth/sync-profile";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    await syncProfile(user);
    return NextResponse.json({ success: true });
  } catch (cause) {
    console.error("Profile synchronization failed:", cause);
    return NextResponse.json({ error: "Could not synchronize your account." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Name must contain between 2 and 100 characters." }, { status: 400 });
  }
  if (phone.length > 30) {
    return NextResponse.json({ error: "Phone number is too long." }, { status: 400 });
  }

  try {
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    if (metadataError) throw metadataError;

    const profile = await prisma.user.update({
      where: { id: user.id },
      data: { name, phone: phone || null },
      select: { name: true, phone: true },
    });
    return NextResponse.json({ profile });
  } catch (cause) {
    console.error("Profile update failed:", cause);
    return NextResponse.json({ error: "Could not update profile. The phone number may already be in use." }, { status: 409 });
  }
}
