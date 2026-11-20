"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, LoaderCircle, Package, Plus, Store, Trash2 } from "lucide-react";

type Category = { id: string; name: string; slug: string };
type Product = { id: string; name: string; price: number; stock: number; status: string; categoryName: string; createdAt: string; images: { id: string; url: string; altText: string | null }[] };
type UploadedImage = { url: string; storagePath: string; preview: string };

export default function SellerProducts({ storeName, categories, initialProducts }: { storeName: string; categories: Category[]; initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: "", description: "", categoryId: categories[0]?.id ?? "", price: "", stock: "", sku: "" });

  async function chooseFiles(files: FileList | null) {
    if (!files) return;
    setMessage("");
    const selected = Array.from(files);
    if (images.length + selected.length > 8) { setMessage("Maximum 8 photos par produit."); return; }
    for (const file of selected) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setMessage("Formats acceptés : JPG, PNG et WEBP."); continue; }
      if (file.size > 5 * 1024 * 1024) { setMessage("Chaque photo doit faire moins de 5 Mo."); continue; }
      setBusy(true);
      try {
        const data = new FormData(); data.append("file", file);
        const response = await fetch("/api/seller/product-images", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Téléversement impossible.");
        setImages((current) => [...current, { url: result.url, storagePath: result.storagePath, preview: URL.createObjectURL(file) }]);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erreur de téléversement.");
      } finally { setBusy(false); }
    }
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (images.length === 0) throw new Error("Ajoutez au moins une vraie photo du produit.");
      const response = await fetch("/api/seller/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock), images: images.map((image) => image.storagePath) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Création impossible.");
      const p = result.product;
      setProducts((current) => [{
        id: p.id, name: p.name, price: p.price, stock: p.stock, status: p.status,
        categoryName: p.category.name, createdAt: p.createdAt,
        images: p.images,
      }, ...current]);
      setForm({ name: "", description: "", categoryId: categories[0]?.id ?? "", price: "", stock: "", sku: "" });
      setImages([]); setOpen(false); setMessage("Produit envoyé à l’administration pour vérification avant publication.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#173650] sm:px-7">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div><Link href="/seller" className="inline-flex items-center gap-2 text-sm text-[#78858F]"><ArrowLeft size={16}/> Espace vendeur</Link><p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-[#A77D3E]">Catalogue vendeur</p><h1 className="mt-2 text-3xl font-bold">Mes produits</h1><p className="mt-2 text-sm text-[#78858F]">{storeName} · Photos réelles de vos articles</p></div>
        <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-xl bg-[#173650] px-5 py-3 text-sm font-semibold text-white"><Plus size={17}/> Ajouter un produit</button>
      </header>

      {message && <div role="status" className="mb-5 rounded-xl border border-[#E8DFC9] bg-white p-4 text-sm text-[#806A43]">{message}</div>}

      {open && <form onSubmit={createProduct} className="mb-8 rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-7">
        <div className="mb-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F5EFE5] text-[#A77D3E]"><Package size={21}/></span><div><h2 className="font-bold">Informations du produit</h2><p className="text-xs text-[#87919A]">Ajoutez des photos prises de votre produit réel.</p></div></div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom du produit" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required/>
          <label className="block"><span className="mb-2 block text-sm font-medium">Catégorie</span><select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full rounded-xl border border-[#E5E1D8] bg-white px-4 py-3 text-sm">{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <Field label="Prix de vente (FCFA)" type="number" min="1" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required/>
          <Field label="Quantité en stock" type="number" min="0" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required/>
          <Field label="Référence SKU (facultatif)" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })}/>
          <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium">Description</span><textarea required minLength={10} maxLength={3000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-[#E5E1D8] px-4 py-3 text-sm outline-none focus:border-[#C6A15B]"/></label>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">Photos du produit</span><span className="text-xs text-[#87919A]">{images.length}/8 · JPG, PNG, WEBP · 5 Mo max/photo</span></div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { void chooseFiles(e.target.files); e.currentTarget.value = ""; }}/>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy || images.length >= 8} className="flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#DCCFB9] bg-[#FCFBF8] p-5 text-sm text-[#8A7149] disabled:opacity-50"><ImagePlus size={27}/><strong>Choisir des photos réelles</strong><span className="text-xs text-[#92999F]">Vous pouvez ajouter jusqu'à 8 angles du produit.</span></button>
          {images.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image, index) => <div key={image.storagePath} className="relative overflow-hidden rounded-xl border border-[#E9E3D7] bg-white"><img src={image.preview} alt={`Aperçu ${index + 1}`} className="h-36 w-full object-cover"/><span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold">{index === 0 ? "Photo principale" : `Photo ${index + 1}`}</span><button type="button" onClick={() => removeImage(index)} aria-label="Retirer la photo" className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow"><Trash2 size={14}/></button></div>)}</div>}
        </div>
        <div className="mt-7 flex flex-wrap gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#173650] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy && <LoaderCircle size={16} className="animate-spin"/>} Publier le produit</button><button type="button" onClick={() => { setOpen(false); setImages([]); }} className="rounded-xl border border-[#E5E1D8] px-5 py-3 text-sm">Annuler</button></div>
      </form>}

      <section className="rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Catalogue de la boutique</h2><p className="mt-1 text-xs text-[#87919A]">{products.length} produit(s)</p></div><Store className="text-[#A77D3E]"/></div>
        {products.length === 0 ? <div className="py-16 text-center"><Package size={32} className="mx-auto text-[#C6A15B]"/><p className="mt-3 text-sm text-[#87919A]">Aucun produit. Ajoutez votre premier article avec ses photos.</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-xl border border-[#EEE8DF]"><div className="grid h-48 grid-cols-2 gap-1 bg-[#F7F5EF]">{product.images.slice(0, 2).map((image) => <img key={image.id} src={image.url} alt={image.altText ?? product.name} className="h-48 w-full object-cover"/>)}{product.images.length === 0 && <div className="col-span-2 grid place-items-center text-sm text-[#92999F]">Photo indisponible</div>}</div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#A77D3E]">{product.categoryName}</p><h3 className="mt-1 font-semibold">{product.name}</h3><div className="mt-3 flex items-center justify-between text-sm"><strong>{new Intl.NumberFormat("fr-FR").format(product.price)} FCFA</strong><span className="text-[#78858F]">Stock : {product.stock}</span></div><p className="mt-2 text-xs text-[#78858F]">Statut : {product.status === "ACTIVE" ? "Publié" : product.status === "PENDING_REVIEW" ? "En attente de validation" : product.status === "DRAFT" ? "Brouillon" : product.status}</p></div></article>)}</div>}
      </section>
    </div>
  </main>;
}

function Field({ label, value, onChange, type = "text", min, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; min?: string; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium">{label}</span><input type={type} min={min} required={required} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-[#E5E1D8] px-4 py-3 text-sm outline-none focus:border-[#C6A15B]"/></label>;
}
