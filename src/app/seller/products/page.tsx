import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import SellerProducts from "@/components/seller/seller-products";

async function ProductsContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, storeName: true, isApproved: true },
  });
  if (!seller?.isApproved) redirect("/account");

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true } }, images: { orderBy: { position: "asc" }, select: { id: true, url: true, altText: true } } },
  });

  return <SellerProducts storeName={seller.storeName} categories={categories} initialProducts={products.map((p) => ({
    id: p.id, name: p.name, price: p.price, stock: p.stock, status: p.status,
    categoryName: p.category.name, createdAt: p.createdAt.toISOString(),
    images: p.images,
  }))} />;
}

export default function SellerProductsPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F7F5EF] p-8">Chargement du catalogue…</main>}><ProductsContent /></Suspense>;
}
