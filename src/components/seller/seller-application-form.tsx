"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, LoaderCircle, Store } from "lucide-react";

type Application = { status: "PENDING" | "APPROVED" | "REJECTED"; storeName: string; reviewNote: string | null } | null;

export default function SellerApplicationForm({ application }: { application: Application }) {
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [current, setCurrent] = useState(application);
  const [form, setForm] = useState({ storeName: "", description: "", phone: "", city: "Abéché", address: "" });
  const ar = lang === "ar";
  const t = ar ? {
    title: "افتح متجرك على ABBASIA", subtitle: "أرسل طلبك للمراجعة. سيتم تفعيل المتجر بعد موافقة الإدارة.", store: "اسم المتجر", desc: "وصف النشاط والمتجر", phone: "رقم الهاتف", city: "المدينة", address: "العنوان", submit: "إرسال الطلب", back: "العودة إلى حسابي", pending: "طلبك قيد المراجعة", approved: "تمت الموافقة على متجرك", rejected: "تم رفض الطلب. يمكنك إرسال طلب جديد.", note: "ملاحظة الإدارة", success: "تم إرسال طلبك بنجاح. ستتم مراجعته من فريق ABBASIA.", error: "تعذر إرسال الطلب. تحقق من الحقول وحاول مجدداً.",
  } : {
    title: "Ouvrez votre boutique sur ABBASIA", subtitle: "Soumettez votre demande. Votre boutique sera activée après validation par notre équipe.", store: "Nom de la boutique", desc: "Description de votre activité", phone: "Téléphone", city: "Ville", address: "Adresse", submit: "Envoyer la demande", back: "Retour à mon espace", pending: "Votre demande est en cours d'examen", approved: "Votre boutique est approuvée", rejected: "Demande refusée. Vous pouvez soumettre une nouvelle demande.", note: "Note de l'administration", success: "Demande envoyée. Notre équipe va l'examiner.", error: "Impossible d'envoyer la demande. Vérifiez les champs.",
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/seller/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.error);
      setCurrent({ status: "PENDING", storeName: data.application.storeName, reviewNote: null });
      setMessage(t.success);
    } catch (err) { setMessage(err instanceof Error ? err.message : t.error); }
    finally { setBusy(false); }
  }

  return <main dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-[#F7F5EF] px-5 py-10 text-[#173650]">
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex items-center justify-between"><Link href="/account" className="font-bold">ABBASIA<span className="text-[#C6A15B]">.SHOP</span></Link><button onClick={() => setLang(ar ? "fr" : "ar")} className="rounded-full border border-[#E4DDCF] bg-white px-4 py-2 text-sm">{ar ? "Français" : "العربية"}</button></header>
      <section className="rounded-3xl border border-[#E9E3D7] bg-white p-7 shadow-sm sm:p-10">
        <Link href="/account" className="mb-7 inline-flex items-center gap-2 text-sm text-[#7B8790]"><ArrowLeft size={16}/>{t.back}</Link>
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5EFE5] text-[#A77D3E]"><Store size={26}/></div>
        <h1 className="text-3xl font-semibold">{t.title}</h1><p className="mt-3 text-sm leading-6 text-[#7B8790]">{t.subtitle}</p>
        {current && <div className="mt-7 rounded-2xl border border-[#E9E3D7] bg-[#FCFBF8] p-5"><div className="flex items-center gap-3"><CheckCircle2 className="text-[#A77D3E]"/><strong>{current.status === "PENDING" ? t.pending : current.status === "APPROVED" ? t.approved : t.rejected}</strong></div><p className="mt-2 text-sm text-[#75828C]">{current.storeName}</p>{current.reviewNote && <p className="mt-3 text-sm">{t.note}: {current.reviewNote}</p>}</div>}
        {(!current || current.status === "REJECTED") && <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label={t.store} value={form.storeName} onChange={v => setForm({...form, storeName:v})}/><Field label={t.phone} value={form.phone} onChange={v => setForm({...form, phone:v})}/><Field label={t.city} value={form.city} onChange={v => setForm({...form, city:v})}/><Field label={t.address} value={form.address} onChange={v => setForm({...form, address:v})}/>
          <label className="sm:col-span-2"><span className="mb-2 block text-sm font-medium">{t.desc}</span><textarea required minLength={20} maxLength={1000} rows={4} value={form.description} onChange={e => setForm({...form, description:e.target.value})} className="w-full rounded-xl border border-[#E5E1D8] px-4 py-3 text-sm outline-none focus:border-[#C6A15B]"/></label>
          {message && <p role="status" className="sm:col-span-2 rounded-xl bg-[#F7F3EA] p-3 text-sm text-[#806A43]">{message}</p>}
          <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173650] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">{busy && <LoaderCircle size={17} className="animate-spin"/>}{t.submit}</button>
        </form>}
        {current?.status === "PENDING" && message && <p className="mt-4 rounded-xl bg-[#F7F3EA] p-3 text-sm text-[#806A43]">{message}</p>}
      </section>
    </div>
  </main>;
}
function Field({ label, value, onChange }: {label:string;value:string;onChange:(v:string)=>void}) { return <label><span className="mb-2 block text-sm font-medium">{label}</span><input required value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-[#E5E1D8] px-4 py-3 text-sm outline-none focus:border-[#C6A15B]"/></label>; }
