"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, RefreshCw } from "lucide-react";

export type OrderRow = {
  id: string; orderNumber: string; status: string; total: number; subtotal: number; createdAt: string;
  customerName?: string; customerPhone?: string; sellerName?: string; paymentStatus?: string;
  items: { name: string; quantity: number; lineTotal: number }[]; canCancel?: boolean; sellerOrderId?: string;
};
const labels: Record<string,string> = { PENDING:"Nouvelle", CONFIRMED:"Confirmée", PROCESSING:"En préparation", SHIPPED:"Expédiée", DELIVERED:"Livrée", CANCELLED:"Annulée" };
const money=(n:number)=>new Intl.NumberFormat("fr-FR").format(n)+" FCFA";

export default function OrderManagement({ title, subtitle, rows, mode }: { title:string; subtitle:string; rows:OrderRow[]; mode:"customer"|"seller"|"admin" }) {
  const [busy,setBusy]=useState<string|null>(null); const [notice,setNotice]=useState("");
  async function update(row:OrderRow,status:string){
    setBusy(row.id);setNotice("");
    try { const body=mode==="seller"?{sellerOrderId:row.sellerOrderId,status}:{orderId:row.id,status}; const res=await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.error||"Échec");window.location.reload(); }
    catch(e){setNotice(e instanceof Error?e.message:"Erreur");setBusy(null);}
  }
  async function markPaid(row:OrderRow){setBusy(row.id);try{const res=await fetch("/api/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:row.id,paymentAction:"MARK_PAID"})});const data=await res.json();if(!res.ok)throw new Error(data.error||"Erreur");window.location.reload();}catch(e){setNotice(e instanceof Error?e.message:"Erreur");setBusy(null);}}
  return <main className="min-h-screen bg-[#F7F5EF] px-5 py-9 text-[#173650]">
    <div className="mx-auto max-w-7xl">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="font-bold">ABBASIA<span className="text-[#C6A15B]">.SHOP</span></Link><p className="mt-4 text-xs uppercase tracking-[.2em] text-[#A77D3E]">Gestion des commandes</p><h1 className="mt-1 text-3xl font-semibold">{title}</h1><p className="mt-2 text-sm text-[#778590]">{subtitle}</p></div><Link href={mode==="seller"?"/seller":mode==="admin"?"/admin/sellers":"/account"} className="rounded-xl border border-[#E6DFD3] bg-white px-4 py-3 text-sm">Retour</Link></header>
      {notice&&<p className="mb-4 rounded-xl bg-white p-4 text-sm">{notice}</p>}
      {rows.length===0?<div className="rounded-2xl border border-[#E8E2D7] bg-white p-12 text-center text-[#82909B]">Aucune commande pour le moment.</div>:<div className="space-y-4">{rows.map(r=><article key={r.id} className="rounded-2xl border border-[#E8E2D7] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-[#A77D3E]">{new Date(r.createdAt).toLocaleDateString("fr-FR",{dateStyle:"medium"})}</p><h2 className="mt-1 text-lg font-bold">#{r.orderNumber}</h2>{r.customerName&&<p className="mt-1 text-sm">Client : {r.customerName} {r.customerPhone&&`· ${r.customerPhone}`}</p>}{r.sellerName&&<p className="mt-1 text-sm">Boutique : {r.sellerName}</p>}</div><div className="text-right"><p className="text-xl font-bold">{money(r.total)}</p><p className="mt-1 inline-block rounded-full bg-[#F5EFE5] px-3 py-1 text-sm">{labels[r.status]||r.status}</p>{r.paymentStatus&&<p className="mt-1 text-xs text-[#7C8994]">Paiement : {r.paymentStatus}</p>}</div></div>
        <div className="mt-4 border-t border-[#F0ECE5] pt-3"><ul className="space-y-1 text-sm text-[#667783]">{r.items.map((it,i)=><li key={i} className="flex justify-between gap-3"><span>{it.name} × {it.quantity}</span><span>{money(it.lineTotal)}</span></li>)}</ul></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {mode==="customer"&&r.canCancel&&<button disabled={busy===r.id} onClick={()=>update(r,"CANCELLED")} className="rounded-lg border px-3 py-2 text-sm">Annuler la commande</button>}
          {mode==="seller"&&r.status==="PENDING"&&<button disabled={busy===r.id} onClick={()=>update(r,"CONFIRMED")} className="rounded-lg bg-[#173650] px-3 py-2 text-sm font-semibold text-white">Confirmer</button>}
          {mode==="seller"&&r.status==="CONFIRMED"&&<button disabled={busy===r.id} onClick={()=>update(r,"PROCESSING")} className="rounded-lg bg-[#173650] px-3 py-2 text-sm font-semibold text-white">Préparer</button>}
          {mode==="seller"&&r.status==="PROCESSING"&&<button disabled={busy===r.id} onClick={()=>update(r,"SHIPPED")} className="rounded-lg bg-[#173650] px-3 py-2 text-sm font-semibold text-white">Prête / expédiée</button>}
          {mode==="seller"&&r.status==="SHIPPED"&&<button disabled={busy===r.id} onClick={()=>update(r,"DELIVERED")} className="rounded-lg bg-[#173650] px-3 py-2 text-sm font-semibold text-white">Marquer livrée</button>}
          {mode==="admin"&&<><button disabled={busy===r.id} onClick={()=>update(r,"CONFIRMED")} className="rounded-lg bg-[#173650] px-3 py-2 text-sm font-semibold text-white">Confirmer</button><button disabled={busy===r.id} onClick={()=>update(r,"PROCESSING")} className="rounded-lg border px-3 py-2 text-sm">En préparation</button><button disabled={busy===r.id} onClick={()=>update(r,"SHIPPED")} className="rounded-lg border px-3 py-2 text-sm">Expédiée</button><button disabled={busy===r.id} onClick={()=>update(r,"DELIVERED")} className="rounded-lg border px-3 py-2 text-sm">Livrée</button><button disabled={busy===r.id} onClick={()=>update(r,"CANCELLED")} className="rounded-lg border px-3 py-2 text-sm">Annuler</button>{r.paymentStatus==="PENDING"&&<button disabled={busy===r.id} onClick={()=>markPaid(r)} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white"><CheckCircle2 size={15} className="mr-1 inline"/>COD encaissé</button>}</>}
        </div>
      </article>)}</div>}
      <div className="mt-6 flex items-center gap-2 text-xs text-[#8B969E]"><RefreshCw size={14}/> Les statuts sont actualisés après chaque action.</div>
    </div>
  </main>;
}
