import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import AccountDashboard from "@/components/account/account-dashboard";

async function AccountContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, name: true, email: true, phone: true, role: true, status: true, createdAt: true,
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }], select: { id: true, fullName: true, phone: true, city: true, district: true, addressLine: true, instructions: true, isDefault: true } },
      orders: { orderBy: { createdAt: "desc" }, take: 5, select: { id: true, orderNumber: true, status: true, total: true, currency: true, createdAt: true, sellerOrders: { select: { id: true } } } },
      _count: { select: { orders: true, addresses: true } },
    },
  });
  if (!profile || profile.status !== "ACTIVE") redirect("/auth?error=profile");
  return <><div className="mx-auto max-w-7xl px-5 pt-5"><a href="/account/notifications" className="inline-flex rounded-xl border border-[#D9D0C2] bg-white px-4 py-2 text-sm text-[#102D49]">Mes notifications</a></div><AccountDashboard profile={{ id: profile.id, name: profile.name, email: profile.email, phone: profile.phone, role: profile.role, createdAt: profile.createdAt.toISOString() }} addresses={profile.addresses} orders={profile.orders.map(order => ({ ...order, createdAt: order.createdAt.toISOString(), sellerCount: order.sellerOrders.length }))} counts={profile._count} /></>;
}
function Loading() { return <main className="min-h-screen bg-[#F7F5EF] p-8"><div className="mx-auto max-w-7xl animate-pulse space-y-5"><div className="h-12 w-64 rounded-xl bg-[#E9E3D7]"/><div className="grid gap-5 md:grid-cols-3">{[1,2,3].map(x=><div key={x} className="h-36 rounded-2xl bg-white"/>)}</div><div className="h-80 rounded-2xl bg-white"/></div></main>; }
export default function AccountPage() { return <Suspense fallback={<Loading/>}><AccountContent/></Suspense>; }
