import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id }, select: { id: true, isApproved: true } });
  if (!seller?.isApproved) return NextResponse.json({ error: "Accès vendeur refusé." }, { status: 403 });

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true, slug: true } }, images: { orderBy: { position: "asc" }, select: { id: true, url: true, altText: true } } },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const seller = await prisma.sellerProfile.findUnique({ where: { userId: user.id }, select: { id: true, isApproved: true } });
  if (!seller?.isApproved) return NextResponse.json({ error: "Votre boutique doit être approuvée." }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides." }, { status: 400 }); }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const categoryId = typeof body.categoryId === "string" ? body.categoryId : "";
  const price = Number(body.price);
  const stock = Number(body.stock);
  const sku = typeof body.sku === "string" ? body.sku.trim().slice(0, 80) : null;
  const paths = Array.isArray(body.images) ? body.images.filter((v): v is string => typeof v === "string") : [];

  if (name.length < 3 || name.length > 120 || description.length < 10 || description.length > 3000) {
    return NextResponse.json({ error: "Le nom doit contenir 3 caractères et la description 10 caractères minimum." }, { status: 400 });
  }
  if (!Number.isSafeInteger(price) || price < 1 || price > 1000000000 || !Number.isSafeInteger(stock) || stock < 0 || stock > 1000000) {
    return NextResponse.json({ error: "Prix ou quantité de stock invalide." }, { status: 400 });
  }
  if (paths.length < 1 || paths.length > 8 || paths.some((path) => !path.startsWith(`${user.id}/`) || path.includes(".."))) {
    return NextResponse.json({ error: "Ajoutez entre 1 et 8 photos appartenant à votre compte." }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) return NextResponse.json({ error: "Catégorie introuvable." }, { status: 400 });

  const { data: storedFiles, error: storageListError } = await supabase.storage.from("product-images").list(user.id, { limit: 1000 });
  if (storageListError || paths.some((path) => !storedFiles?.some((file) => `${user.id}/${file.name}` === path))) {
    return NextResponse.json({ error: "Une ou plusieurs photos n'ont pas été téléversées correctement." }, { status: 400 });
  }

  const slugBase = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "produit";
  const slug = `${slugBase}-${crypto.randomUUID().slice(0, 8)}`;
  const storageBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!storageBase) return NextResponse.json({ error: "Configuration Supabase manquante." }, { status: 500 });

  const images = paths.map((storagePath, position) => ({
    storagePath,
    url: `${storageBase}/storage/v1/object/public/product-images/${storagePath}`,
    altText: name,
    position,
  }));

  try {
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id, categoryId, name, slug, description,
        price, stock, sku: sku || null, status: "PENDING_REVIEW",
        imageUrl: images[0].url,
        images: { create: images },
        inventoryMovements: { create: { quantity: stock, reason: "INITIAL_STOCK", reference: "PRODUCT_CREATION" } },
      },
      include: { category: { select: { name: true, slug: true } }, images: { orderBy: { position: "asc" } } },
    });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Product creation failed:", error);
    return NextResponse.json({ error: "Création impossible. Vérifiez que le SKU n'est pas déjà utilisé." }, { status: 409 });
  }
}
