"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

type CartProduct = { id: string; name: string; price: number; imageUrl: string | null; storeName: string; isDemo: boolean };
type CartEntry = { id: string; quantity: number; product: CartProduct };
const money = (value: number) => `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;

export default function CartPage() {
  const [items, setItems] = useState<CartEntry[]>([]);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("abbasia-cart") || "[]")); } catch { setItems([]); } }, []);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const persist = (next: CartEntry[]) => { setItems(next); localStorage.setItem("abbasia-cart", JSON.stringify(next)); window.dispatchEvent(new Event("abbasia-cart-updated")); };
  const change = (id: string, delta: number) => persist(items.map((item) => item.id === id ? {...item, quantity: Math.max(1, item.quantity + delta)} : item));
  const remove = (id: string) => persist(items.filter((item) => item.id !== id));

  return <main className="min-h-screen bg-[#f7f5f0] text-[#19364d]">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={17}/> Continuer mes achats</Link>
      <h1 className="text-xl font-bold">Mon panier</h1>
    </header>
    <div className="mx-auto grid max-w-6xl gap-6 px-5 pb-12 lg:grid-cols-[1fr_350px]">
      <section className="space-y-4">
        {items.length === 0 ? <div className="rounded-2xl border border-[#e4dfd4] bg-white p-10 text-center">
          <ShoppingBag className="mx-auto mb-3 text-[#c8a45d]" size={38}/>
          <h2 className="text-lg font-semibold">Votre panier est vide</h2>
          <p className="mt-2 text-sm text-slate-500">Découvrez les produits disponibles sur ABBASIA.</p>
          <Link href="/" className="mt-5 inline-flex rounded-xl bg-[#19364d] px-5 py-3 text-white">Découvrir les produits</Link>
        </div> : items.map(item => <article key={item.id} className="flex gap-4 rounded-2xl border border-[#e7e1d6] bg-white p-4">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f2eee6]">
            {item.product.imageUrl ? <Image src={item.product.imageUrl} alt={item.product.name} fill sizes="96px" className="object-cover" unoptimized/> : <ShoppingBag className="m-auto mt-8 text-slate-400"/>}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">{item.product.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{item.product.storeName}{item.product.isDemo ? " · Produit de démonstration" : ""}</p>
            <p className="mt-2 font-bold">{money(item.product.price)}</p>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => change(item.id,-1)} aria-label="Diminuer" disabled={item.quantity <= 1} className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-35"><Minus size={14}/></button>
              <span className="min-w-7 text-center text-sm">{item.quantity}</span>
              <button onClick={() => change(item.id,1)} aria-label="Augmenter" className="rounded-lg border p-2"><Plus size={14}/></button>
              <button onClick={() => remove(item.id)} className="ml-2 inline-flex items-center gap-1 text-xs text-red-600"><Trash2 size={14}/> Retirer</button>
            </div>
          </div>
        </article>)}
      </section>
      <aside className="h-fit rounded-2xl border border-[#e7e1d6] bg-white p-5">
        <h2 className="text-lg font-semibold">Résumé du panier</h2>
        <div className="mt-5 flex justify-between text-sm"><span>Sous-total</span><strong>{money(subtotal)}</strong></div>
        <div className="mt-3 flex justify-between text-sm"><span>Livraison</span><span>Calculée à la confirmation</span></div>
        <div className="my-4 border-t"/>
        <div className="flex justify-between text-base font-bold"><span>Total estimé</span><span>{money(subtotal)}</span></div>
        {items.some(i => i.product.isDemo) && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Les articles de démonstration sont destinés à tester l’interface. Ils ne peuvent pas être commandés.</p>}
        <Link href="/checkout" className={`mt-5 block rounded-xl px-4 py-3 text-center font-semibold text-white ${items.length ? "bg-[#19364d]" : "pointer-events-none bg-slate-300"}`}>Passer à la commande</Link>
      </aside>
    </div>
  </main>;
}
