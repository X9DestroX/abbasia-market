import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import DeliveryDashboard from "@/components/delivery/delivery-dashboard";
async function Gate(){await connection();const sb=await createClient();const {data:{user}}=await sb.auth.getUser();if(!user)redirect("/auth");const actor=await prisma.user.findUnique({where:{id:user.id},select:{role:true,status:true}});if(!actor||actor.status!=="ACTIVE"||!["ADMIN","SUPER_ADMIN"].includes(actor.role))redirect("/account");return <DeliveryDashboard/>}
export default function Page(){return <Suspense fallback={<main className="p-8">Chargement logistique…</main>}><Gate/></Suspense>}
