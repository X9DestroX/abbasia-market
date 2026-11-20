"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, Package, X } from "lucide-react";

type Product = { id: string; name: string; description: string; price: number; stock: number; category: string; storeName: string; sellerName: string; sellerEmail: string | null; createdAt: string; images: { id: string; url: string; altText: string | null }[] };

export default function AdminProducts({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function decide(id: string, decision: "APPROVED" | "REJECTED") {
    setBusy(id); setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Action impossible.");
      setProducts((current) => current.filter((product) => product.id !== id));
      setMessage(decision === "APPROVED" ? "Produit approuvé et publié." : "Produit refusé et renvoyé en brouillon.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur.");
    } finally { setBusy(""); }
  }

  return <main className="min-h-screen bg-[#F7F5EF] px-4 py-9 text-[#173650] sm:px-7"><div className="mx-auto max-w-7xl">
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Link href="/admin/sellers" className="inline-flex items-center gap-2 text-sm text-[#78858F]"><ArrowLeft size={16}/> Administration</Link><p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-[#A77D3E]">Modération catalogue</p><h1 className="mt-2 text-3xl font-bold">Produits à vérifier</h1><p className="mt-2 text-sm text-[#78858F]">Vérifiez les photos, la description et les informations avant publication.</p></div><div className="rounded-xl border border-[#E9E3D7] bg-white px-4 py-3 text-sm">{products.length} en attente</div></header>
    {message && <div role="status" className="mb-5 rounded-xl bg-white p-4 text-sm">{message}</div>}
    {products.length === 0 ? <div className="rounded-2xl border border-[#E9E3D7] bg-white py-20 text-center"><Package size={35} className="mx-auto text-[#C6A15B]"/><p className="mt-3 text-sm text-[#78858F]">Aucun produit en attente de vérification.</p></div> : <div className="space-y-5">{products.map((p) => <article key={p.id} className="rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-6"><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"><div><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#A77D3E]">{p.category}</p><h2 className="mt-1 text-xl font-bold">{p.name}</h2><p className="mt-1 text-sm text-[#78858F]">{p.storeName} · {p.sellerName} · {p.sellerEmail}</p></div><strong>{new Intl.NumberFormat("fr-FR").format(p.price)} FCFA</strong></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#667583]">{p.description}</p><p className="mt-3 text-xs text-[#78858F]">Stock déclaré : {p.stock} · {p.images.length} photo(s)</p><div className="mt-5 flex flex-wrap gap-3"><button disabled={busy === p.id} onClick={() => void decide(p.id, "APPROVED")} className="inline-flex items-center gap-2 rounded-xl bg-[#173650] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy === p.id ? <LoaderCircle size={16} className="animate-spin"/> : <Check size={16}/>} Approuver et publier</button><button disabled={busy === p.id} onClick={() => void decide(p.id, "REJECTED")} className="inline-flex items-center gap-2 rounded-xl border border-[#E7D6D2] px-4 py-3 text-sm font-semibold text-[#A45D55] disabled:opacity-50"><X size={16}/> Refuser</button></div></div><div className="grid grid-cols-2 gap-2">{p.images.map((image) => <img key={image.id} src={image.url} alt={image.altText ?? p.name} className="h-36 w-full rounded-xl object-cover"/>)}</div></div></article>)}</div>}
  </div></main>;
}
