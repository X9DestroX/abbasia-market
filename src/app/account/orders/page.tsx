import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import OrderManagement, { OrderRow } from "@/components/orders/order-management";
async function Content(){await connection();const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/auth");const orders=await prisma.order.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},include:{payments:true,sellerOrders:{include:{seller:{select:{storeName:true}},items:true}}}});const rows:OrderRow[]=orders.map(o=>({id:o.id,orderNumber:o.orderNumber,status:o.status,total:o.total,subtotal:o.subtotal,createdAt:o.createdAt.toISOString(),paymentStatus:o.payments[0]?.status,canCancel:o.status==="PENDING",items:o.sellerOrders.flatMap(s=>s.items.map(i=>({name:i.productName,quantity:i.quantity,lineTotal:i.lineTotal})))}));return <OrderManagement title="Mes commandes" subtitle="Suivez vos achats ABBASIA.SHOP" rows={rows} mode="customer"/>}
export default function Page(){return <Suspense fallback={<main className="p-10">Chargement…</main>}><Content/></Suspense>}
