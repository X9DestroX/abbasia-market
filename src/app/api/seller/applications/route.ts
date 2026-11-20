import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true, role: true } });
  if (!profile || profile.status !== "ACTIVE") return NextResponse.json({ error: "Compte indisponible." }, { status: 403 });
  if (profile.role === "SELLER") return NextResponse.json({ error: "Votre boutique est déjà activée." }, { status: 409 });

  const body = await request.json();
  const storeName = String(body.storeName ?? "").trim();
  const description = String(body.description ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const city = String(body.city ?? "").trim();
  const address = String(body.address ?? "").trim();

  if (storeName.length < 3 || description.length < 20 || phone.length < 6 || !city || address.length < 5) {
    return NextResponse.json({ error: "Veuillez compléter tous les champs. La description doit contenir au moins 20 caractères." }, { status: 400 });
  }
  if (storeName.length > 80 || description.length > 1000 || address.length > 250) {
    return NextResponse.json({ error: "Certains champs dépassent la longueur autorisée." }, { status: 400 });
  }

  const existing = await prisma.sellerApplication.findUnique({ where: { userId: user.id } });
  if (existing?.status === "PENDING" || existing?.status === "APPROVED") {
    return NextResponse.json({ error: "Une demande est déjà en cours ou approuvée." }, { status: 409 });
  }

  const application = await prisma.sellerApplication.upsert({
    where: { userId: user.id },
    create: { userId: user.id, storeName, description, phone, city, address },
    update: { storeName, description, phone, city, address, status: "PENDING", reviewNote: null, reviewedAt: null },
    select: { id: true, status: true, storeName: true, createdAt: true },
  });

  return NextResponse.json({ success: true, application });
}
