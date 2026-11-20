import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import SellerApplicationForm from "@/components/seller/seller-application-form";

async function ApplyContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const profile = await prisma.user.findUnique({ where: { id: user.id }, select: { status: true, role: true } });
  if (!profile || profile.status !== "ACTIVE") redirect("/auth?error=profile");
  if (profile.role === "SELLER") redirect("/seller");
  const application = await prisma.sellerApplication.findUnique({ where: { userId: user.id }, select: { status: true, storeName: true, reviewNote: true } });
  return <SellerApplicationForm application={application} />;
}

export default function SellerApplyPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#F7F5EF] p-10">Chargement…</main>}><ApplyContent /></Suspense>;
}
