import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true } });
  if (!admin || admin.status !== "ACTIVE" || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
    return NextResponse.json({ error: "Accès administrateur requis." }, { status: 403 });
  }

  const { id } = await context.params;
  let body: { decision?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }
  if (body.decision !== "APPROVED" && body.decision !== "REJECTED") {
    return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id }, select: { id: true, status: true, name: true } });
  if (!product || product.status !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "Produit introuvable ou déjà traité." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { status: body.decision === "APPROVED" ? "ACTIVE" : "DRAFT" } });
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        action: body.decision === "APPROVED" ? "PRODUCT_APPROVED" : "PRODUCT_REJECTED",
        entity: "Product",
        entityId: id,
        metadata: { name: product.name },
      },
    });
  });

  return NextResponse.json({ success: true, status: body.decision === "APPROVED" ? "ACTIVE" : "DRAFT" });
}
