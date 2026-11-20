import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type RequestItem = { productId?: unknown; quantity?: unknown };

export async function POST(request: Request) {
  const supabase = await createClient();
  let { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (token && url && key) {
      const tokenClient = createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const verified = await tokenClient.auth.getUser(token);
      authUser = verified.data.user;
    }
  }
  if (!authUser) return NextResponse.json({ error: "Connectez-vous pour passer commande." }, { status: 401 });

  const body = await request.json().catch(() => null) as null | {
    items?: RequestItem[];
    shipping?: { fullName?: string; phone?: string; city?: string; addressLine?: string; instructions?: string };
    paymentMethod?: string;
  };
  const items = body?.items;
  const shipping = body?.shipping;
  if (!Array.isArray(items) || items.length < 1 || items.length > 40 || !shipping) {
    return NextResponse.json({ error: "Données de commande invalides." }, { status: 400 });
  }
  const fullName = String(shipping.fullName || "").trim();
  const phone = String(shipping.phone || "").trim();
  const city = String(shipping.city || "").trim();
  const addressLine = String(shipping.addressLine || "").trim();
  if (!fullName || !phone || !city || !addressLine || fullName.length > 100 || phone.length > 30 || city.length > 100 || addressLine.length > 300) {
    return NextResponse.json({ error: "Vérifiez vos informations de livraison." }, { status: 400 });
  }
  if (body?.paymentMethod && body.paymentMethod !== "CASH_ON_DELIVERY") {
    return NextResponse.json({ error: "Ce moyen de paiement n'est pas encore disponible." }, { status: 400 });
  }

  const quantities = new Map<string, number>();
  for (const entry of items) {
    if (typeof entry.productId !== "string" || !entry.productId || !Number.isInteger(entry.quantity) || Number(entry.quantity) < 1 || Number(entry.quantity) > 50) {
      return NextResponse.json({ error: "Un article ou une quantité est invalide." }, { status: 400 });
    }
    quantities.set(entry.productId, (quantities.get(entry.productId) || 0) + Number(entry.quantity));
  }
  if (quantities.size !== items.length) return NextResponse.json({ error: "Articles dupliqués dans le panier. Actualisez le panier." }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.user.upsert({
        where: { id: authUser.id },
        create: { id: authUser.id, name: fullName, email: authUser.email ?? null, phone },
        update: { name: fullName, ...(authUser.email ? { email: authUser.email } : {}), phone },
        select: { id: true, status: true },
      });
      if (profile.status !== "ACTIVE") throw new Error("ACCOUNT_SUSPENDED");

      const products = await tx.product.findMany({
        where: { id: { in: [...quantities.keys()] }, status: "ACTIVE", seller: { isApproved: true } },
        select: { id: true, name: true, price: true, stock: true, sellerId: true },
      });
      if (products.length !== quantities.size) throw new Error("PRODUCT_UNAVAILABLE");
      const bySeller = new Map<string, typeof products>();
      let subtotal = 0;
      for (const product of products) {
        const quantity = quantities.get(product.id)!;
        if (product.stock < quantity) throw new Error("INSUFFICIENT_STOCK");
        subtotal += product.price * quantity;
        bySeller.set(product.sellerId, [...(bySeller.get(product.sellerId) || []), product]);
      }
      if (!Number.isSafeInteger(subtotal) || subtotal <= 0) throw new Error("INVALID_TOTAL");

      const orderNumber = `ABB-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${randomBytes(4).toString("hex").toUpperCase()}`;
      const order = await tx.order.create({ data: {
        orderNumber, userId: profile.id, subtotal, deliveryFee: 0, total: subtotal,
        currency: "XAF", shippingName: fullName, shippingPhone: phone,
        shippingCity: city, shippingAddress: addressLine + (shipping.instructions?.trim() ? ` | ${shipping.instructions.trim().slice(0,500)}` : ""),
        status: "PENDING",
        payments: { create: { method: "CASH_ON_DELIVERY", status: "PENDING", amount: subtotal } },
      }});

      for (const [sellerId, sellerProducts] of bySeller) {
        const sellerSubtotal = sellerProducts.reduce((sum, product) => sum + product.price * quantities.get(product.id)!, 0);
        const sellerOrder = await tx.sellerOrder.create({ data: {
          orderId: order.id, sellerId, subtotal: sellerSubtotal, status: "PENDING",
          delivery: { create: { status: "PENDING", deliveryFee: 0 } },
          items: { create: sellerProducts.map(product => ({
            productId: product.id, productName: product.name, unitPrice: product.price,
            quantity: quantities.get(product.id)!, lineTotal: product.price * quantities.get(product.id)!,
          })) },
        }});
        for (const product of sellerProducts) {
          const quantity = quantities.get(product.id)!;
          const changed = await tx.product.updateMany({
            where: { id: product.id, status: "ACTIVE", stock: { gte: quantity } },
            data: { stock: { decrement: quantity } },
          });
          if (changed.count !== 1) throw new Error("INSUFFICIENT_STOCK");
          await tx.inventoryMovement.create({ data: { productId: product.id, quantity: -quantity, reason: "ORDER_CREATED", reference: order.orderNumber } });
        }
        await tx.notification.create({ data: {
          userId: profile.id, type: "ORDER_UPDATE", title: "Commande reçue",
          message: `Votre commande ${order.orderNumber} a été enregistrée.`,
          href: "/account/orders", metadata: { orderNumber: order.orderNumber, sellerOrderId: sellerOrder.id },
        }});
      }
      await tx.auditLog.create({ data: { actorId: profile.id, action: "ORDER_CREATED", entity: "Order", entityId: order.id, metadata: { orderNumber: order.orderNumber, total: subtotal } } });
      return { id: order.id, orderNumber: order.orderNumber, total: order.total, status: order.status };
    });
    return NextResponse.json({ success: true, order: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const messages: Record<string,string> = {
      ACCOUNT_SUSPENDED: "Votre compte est suspendu.",
      PRODUCT_UNAVAILABLE: "Un ou plusieurs produits ne sont plus disponibles.",
      INSUFFICIENT_STOCK: "Le stock a changé. Actualisez votre panier puis réessayez.",
      INVALID_TOTAL: "Le montant de la commande est invalide.",
    };
    return NextResponse.json({ error: messages[message] || "Impossible de créer la commande. Réessayez." }, { status: message === "ACCOUNT_SUSPENDED" ? 403 : 400 });
  }
}



const allowedSellerTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED"],
  SHIPPED: ["DELIVERED"],
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true, sellerProfile: { select: { id: true, isApproved: true } } } });
  if (!actor || actor.status !== "ACTIVE") return NextResponse.json({ error: "Compte inactif." }, { status: 403 });
  if (["ADMIN", "SUPER_ADMIN"].includes(actor.role)) {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 150, include: { user: { select: { name: true, email: true, phone: true } }, payments: true, sellerOrders: { include: { seller: { select: { storeName: true } }, items: true, delivery: true } } } });
    return NextResponse.json({ scope: "admin", orders });
  }
  if (actor.role === "SELLER" || actor.sellerProfile?.isApproved) {
    const sellerProfile = actor.sellerProfile;
    if (!sellerProfile?.isApproved) return NextResponse.json({ error: "Boutique non approuvée." }, { status: 403 });
    const sellerOrders = await prisma.sellerOrder.findMany({ where: { sellerId: sellerProfile.id }, orderBy: { createdAt: "desc" }, take: 150, include: { order: { include: { user: { select: { name: true, phone: true } }, payments: true } }, seller: { select: { storeName: true } }, items: true, delivery: true } });
    return NextResponse.json({ scope: "seller", sellerOrders });
  }
  const orders = await prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100, include: { payments: true, sellerOrders: { include: { seller: { select: { storeName: true } }, items: true, delivery: true } } } });
  return NextResponse.json({ scope: "customer", orders });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true, sellerProfile: { select: { id: true, isApproved: true } } } });
  if (!actor || actor.status !== "ACTIVE") return NextResponse.json({ error: "Compte inactif." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "");
  const sellerOrderId = typeof body.sellerOrderId === "string" ? body.sellerOrderId : null;
  const orderId = typeof body.orderId === "string" ? body.orderId : null;
  const paymentAction = body.paymentAction === "MARK_PAID";

  if (paymentAction) {
    if (!["ADMIN", "SUPER_ADMIN"].includes(actor.role) || !orderId) return NextResponse.json({ error: "Action réservée à l'administration." }, { status: 403 });
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
    await prisma.$transaction(async tx => {
      await tx.payment.updateMany({ where: { orderId, method: "CASH_ON_DELIVERY", status: "PENDING" }, data: { status: "PAID", paidAt: new Date() } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "COD_PAYMENT_MARKED_PAID", entity: "Order", entityId: orderId, metadata: { orderNumber: order.orderNumber } } });
    });
    return NextResponse.json({ success: true, paymentStatus: "PAID" });
  }

  if (sellerOrderId) {
    if (!actor.sellerProfile?.isApproved || !actor.sellerProfile.id) return NextResponse.json({ error: "Boutique approuvée requise." }, { status: 403 });
    const sellerOrder = await prisma.sellerOrder.findFirst({ where: { id: sellerOrderId, sellerId: actor.sellerProfile.id } });
    if (!sellerOrder) return NextResponse.json({ error: "Commande vendeur introuvable." }, { status: 404 });
    if (!allowedSellerTransitions[sellerOrder.status]?.includes(status)) return NextResponse.json({ error: "Transition de statut non autorisée." }, { status: 400 });
    await prisma.$transaction(async tx => {
      await tx.sellerOrder.update({ where: { id: sellerOrderId }, data: { status: status as never } });
      const siblingStatuses = await tx.sellerOrder.findMany({ where: { orderId: sellerOrder.orderId }, select: { status: true } });
      const overall = siblingStatuses.every(s => s.status === "CANCELLED") ? "CANCELLED" : siblingStatuses.every(s => s.status === "DELIVERED") ? "DELIVERED" : siblingStatuses.some(s => ["PROCESSING", "SHIPPED", "DELIVERED"].includes(s.status)) ? "PROCESSING" : siblingStatuses.some(s => s.status === "CONFIRMED") ? "CONFIRMED" : "PENDING";
      await tx.order.update({ where: { id: sellerOrder.orderId }, data: { status: overall as never } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "SELLER_ORDER_STATUS_UPDATED", entity: "SellerOrder", entityId: sellerOrderId, metadata: { status } } });
    });
    const orderForNotice = await prisma.order.findUnique({ where: { id: sellerOrder.orderId }, select: { userId: true, orderNumber: true } });
    if (orderForNotice) await prisma.notification.create({ data: { userId: orderForNotice.userId, type: "ORDER_UPDATE", title: status === "CONFIRMED" ? "Commande confirmée" : status === "PROCESSING" ? "Préparation en cours" : status === "SHIPPED" ? "Commande expédiée" : "Commande mise à jour", message: `Le statut de votre commande ${orderForNotice.orderNumber} a été mis à jour : ${status}.`, href: "/account/orders", metadata: { orderNumber: orderForNotice.orderNumber, status } } });
    return NextResponse.json({ success: true, status });
  }

  if (orderId && ["ADMIN", "SUPER_ADMIN"].includes(actor.role)) {
    const valid = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!valid.includes(status)) return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    await prisma.$transaction(async tx => {
      await tx.order.update({ where: { id: orderId }, data: { status: status as never } });
      await tx.sellerOrder.updateMany({ where: { orderId }, data: { status: status as never } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "ORDER_STATUS_UPDATED", entity: "Order", entityId: orderId, metadata: { status } } });
    });
    const target = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, orderNumber: true } });
    if (target) await prisma.notification.create({ data: { userId: target.userId, type: "ORDER_UPDATE", title: status === "CONFIRMED" ? "Commande confirmée" : status === "PROCESSING" ? "Préparation en cours" : status === "SHIPPED" ? "Commande expédiée" : status === "DELIVERED" ? "Commande livrée" : "Commande mise à jour", message: `Le statut de votre commande ${target.orderNumber} a été mis à jour : ${status}.`, href: "/account/orders", metadata: { orderNumber: target.orderNumber, status } } });
    return NextResponse.json({ success: true, status });
  }

  if (orderId) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId: user.id } });
    if (!order || order.status !== "PENDING" || status !== "CANCELLED") return NextResponse.json({ error: "Cette commande ne peut plus être annulée." }, { status: 400 });
    await prisma.$transaction(async tx => {
      await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      await tx.sellerOrder.updateMany({ where: { orderId }, data: { status: "CANCELLED" } });
      await tx.auditLog.create({ data: { actorId: user.id, action: "CUSTOMER_ORDER_CANCELLED", entity: "Order", entityId: orderId, metadata: { orderNumber: order.orderNumber } } });
    });
    return NextResponse.json({ success: true, status: "CANCELLED" });
  }
  return NextResponse.json({ error: "Action invalide." }, { status: 400 });
}
