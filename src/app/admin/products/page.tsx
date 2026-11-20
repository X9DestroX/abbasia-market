import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import AdminProducts from "@/components/admin/admin-products";

async function AdminProductsContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const admin = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true } });
  if (!admin || admin.status !== "ACTIVE" || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) redirect("/account");

  const products = await prisma.product.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { createdAt: "asc" },
    include: {
      category: { select: { name: true } },
      seller: { select: { storeName: true, user: { select: { name: true, email: true } } } },
      images: { orderBy: { position: "asc" }, select: { id: true, url: true, altText: true } },
    },
  });

  return <AdminProducts initialProducts={products.map((p) => ({
    id: p.id, name: p.name, description: p.description ?? "", price: p.price,
    stock: p.stock, category: p.category.name, storeName: p.seller.storeName,
    sellerName: p.seller.user.name, sellerEmail: p.seller.user.email,
    createdAt: p.createdAt.toISOString(), images: p.images,
  }))} />;
}

export default function AdminProductsPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F7F5EF] p-8">Chargement des produits…</main>}><AdminProductsContent /></Suspense>;
}
