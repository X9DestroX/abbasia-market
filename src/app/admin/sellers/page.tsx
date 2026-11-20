import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import AdminSellerApplications from "@/components/seller/admin-seller-applications";

async function AdminContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const admin = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, status: true } });
  if (!admin || admin.status !== "ACTIVE" || !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) redirect("/account");
  const applications = await prisma.sellerApplication.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, select: { id: true, storeName: true, description: true, phone: true, city: true, address: true, createdAt: true, user: { select: { name: true, email: true } } } });
  return <AdminSellerApplications applications={applications.map(a => ({ ...a, createdAt: a.createdAt.toISOString() }))} />;
}

export default function AdminSellersPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F7F5EF] p-10">Chargement…</main>}><AdminContent /></Suspense>;
}
