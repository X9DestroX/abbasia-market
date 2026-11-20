import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncProfile } from "@/lib/auth/sync-profile";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/account";

  if (!code) {
    return NextResponse.redirect(new URL("/auth?error=verification", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/auth?error=verification", request.url));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth?error=verification", request.url));
  }

  try {
    await syncProfile(user);
  } catch (cause) {
    console.error("Profile synchronization failed:", cause);
    return NextResponse.redirect(new URL("/auth?error=profile", request.url));
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
