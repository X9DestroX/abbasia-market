import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function adminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const actor = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true } });
  if (!actor || actor.status !== "ACTIVE" || !["ADMIN", "SUPER_ADMIN"].includes(actor.role)) return null;
  return user;
}

export async function GET() {
  const user = await adminUser();
  if (!user) return NextResponse.json({ error: "Accès administration requis." }, { status: 403 });
  const rows = await prisma.sellerOrder.findMany({
    where: { status: { in: ["PROCESSING", "SHIPPED", "DELIVERED"] } },
    orderBy: { updatedAt: "desc" }, take: 250,
    include: { seller: { select: { storeName: true } }, order: { include: { user: { select: { name: true, phone: true } } } }, items: true, delivery: true },
  });
  return NextResponse.json({ deliveries: rows });
}

export async function PATCH(request: Request) {
  const user = await adminUser();
  if (!user) return NextResponse.json({ error: "Accès administration requis." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const sellerOrderId = String(body.sellerOrderId || "");
  if (!sellerOrderId) return NextResponse.json({ error: "sellerOrderId requis." }, { status: 400 });
  const sellerOrder = await prisma.sellerOrder.findUnique({ where: { id: sellerOrderId }, include: { order: true, delivery: true } });
  if (!sellerOrder) return NextResponse.json({ error: "Commande vendeur introuvable." }, { status: 404 });
  const validStatuses = ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"];
  const status = body.status === undefined ? undefined : String(body.status);
  if (status && !validStatuses.includes(status)) return NextResponse.json({ error: "Statut livraison invalide." }, { status: 400 });
  const delivery = await prisma.delivery.upsert({
    where: { sellerOrderId },
    create: { sellerOrderId, status: (status || "PENDING") as never, partnerName: body.partnerName || null, partnerPhone: body.partnerPhone || null, trackingCode: body.trackingCode || null, deliveryFee: Number(body.deliveryFee || 0), cashCollected: Number(body.cashCollected || 0), cashConfirmed: Boolean(body.cashConfirmed), attemptCount: Number(body.attemptCount || 0), notes: body.notes || null, deliveredAt: status === "DELIVERED" ? new Date() : null },
    update: { ...(status ? { status: status as never, deliveredAt: status === "DELIVERED" ? new Date() : undefined } : {}), ...(body.partnerName !== undefined ? { partnerName: body.partnerName || null } : {}), ...(body.partnerPhone !== undefined ? { partnerPhone: body.partnerPhone || null } : {}), ...(body.trackingCode !== undefined ? { trackingCode: body.trackingCode || null } : {}), ...(body.deliveryFee !== undefined ? { deliveryFee: Number(body.deliveryFee) } : {}), ...(body.cashCollected !== undefined ? { cashCollected: Number(body.cashCollected) } : {}), ...(body.cashConfirmed !== undefined ? { cashConfirmed: Boolean(body.cashConfirmed) } : {}), ...(body.attemptCount !== undefined ? { attemptCount: Number(body.attemptCount) } : {}), ...(body.notes !== undefined ? { notes: body.notes || null } : {}) },
  });
  if (status === "DELIVERED") await prisma.sellerOrder.update({ where: { id: sellerOrderId }, data: { status: "DELIVERED" } });
  if (status === "FAILED") await prisma.sellerOrder.update({ where: { id: sellerOrderId }, data: { status: "SHIPPED" } });
  await prisma.auditLog.create({ data: { actorId: user.id, action: "DELIVERY_UPDATED", entity: "Delivery", entityId: delivery.id, metadata: { sellerOrderId, status: status || "UPDATED" } } });
  if (status) {
    const labels: Record<string, { title: string; message: string }> = {
      ASSIGNED: { title: "Livreur assigné", message: "Un livreur a été affecté à votre commande." },
      PICKED_UP: { title: "Colis récupéré", message: "Votre colis a été récupéré par le livreur." },
      IN_TRANSIT: { title: "Commande en route", message: "Votre commande est en route vers votre adresse." },
      DELIVERED: { title: "Commande livrée", message: "Votre commande a été marquée comme livrée." },
      FAILED: { title: "Livraison non aboutie", message: "Une tentative de livraison n'a pas abouti. Notre équipe vous contactera." },
    };
    const notice = labels[status];
    if (notice) await prisma.notification.create({ data: { userId: sellerOrder.order.userId, type: "ORDER_UPDATE", title: notice.title, message: `${notice.message} Référence : ${sellerOrder.order.orderNumber}.`, href: `/track` , metadata: { orderNumber: sellerOrder.order.orderNumber, deliveryStatus: status } } });
  }
  return NextResponse.json({ success: true, delivery });
}
