import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const actor = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true } });
  if (!actor || actor.status !== "ACTIVE" || !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const decision = body.decision;
  const reviewNote = typeof body.reviewNote === "string" ? body.reviewNote.trim().slice(0, 500) : null;
  if (decision !== "APPROVED" && decision !== "REJECTED") return NextResponse.json({ error: "Décision invalide." }, { status: 400 });

  const application = await prisma.sellerApplication.findUnique({ where: { id } });
  if (!application || application.status !== "PENDING") return NextResponse.json({ error: "Demande introuvable ou déjà traitée." }, { status: 404 });

  if (decision === "REJECTED") {
    await prisma.sellerApplication.update({ where: { id }, data: { status: "REJECTED", reviewNote, reviewedAt: new Date() } });
    return NextResponse.json({ success: true, status: "REJECTED" });
  }

  const slugBase = application.storeName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 45) || "boutique";
  const slug = `${slugBase}-${application.id.slice(-6).toLowerCase()}`;

  await prisma.$transaction(async (tx) => {
    await tx.sellerProfile.upsert({
      where: { userId: application.userId },
      create: { userId: application.userId, storeName: application.storeName, slug, description: application.description, isApproved: true },
      update: { storeName: application.storeName, description: application.description, isApproved: true },
    });
    // Seller approval must never downgrade an existing administrator account.
    const applicant = await tx.user.findUnique({ where: { id: application.userId }, select: { role: true } });
    await tx.user.update({
      where: { id: application.userId },
      data: {
        ...(applicant?.role === "SUPER_ADMIN" || applicant?.role === "ADMIN" ? {} : { role: "SELLER" }),
        phone: application.phone,
      },
    });
    await tx.sellerApplication.update({ where: { id }, data: { status: "APPROVED", reviewNote, reviewedAt: new Date() } });
    await tx.auditLog.create({ data: { actorId: user.id, action: "SELLER_APPLICATION_APPROVED", entity: "SellerApplication", entityId: id, metadata: { storeName: application.storeName } } });
  });

  return NextResponse.json({ success: true, status: "APPROVED" });
}
