"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Mail, LoaderCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) { setError("Veuillez saisir une adresse e-mail valide."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });
      if (resetError) throw resetError;
      setMessage("Si cette adresse correspond à un compte, un lien de réinitialisation sera envoyé.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d'envoyer le lien.");
    } finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-5 py-10 text-[#173650]"><section className="w-full max-w-md rounded-3xl border border-[#E9E3D7] bg-white p-8 shadow-sm sm:p-10"><Link href="/auth" className="inline-flex items-center gap-2 text-sm text-[#78838D]"><ArrowLeft size={16}/>Retour à la connexion</Link><div className="mt-9"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F4EFE5] text-[#A77D3E]"><Mail size={22}/></div><h1 className="mt-5 text-2xl font-bold">Mot de passe oublié ?</h1><p className="mt-2 text-sm leading-6 text-[#78838D]">Saisissez l'adresse e-mail associée à votre compte. Nous vous enverrons un lien sécurisé.</p></div><form onSubmit={submit} className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-sm font-medium">Adresse e-mail</span><input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} autoComplete="email" className="w-full rounded-xl border border-[#E4E5E5] px-4 py-3 outline-none focus:border-[#C6A15B]" placeholder="name@example.com"/></label>{message && <p role="status" className="rounded-xl bg-[#F1F7F0] p-3 text-sm text-[#426A4B]">{message}</p>}{error && <p role="alert" className="rounded-xl bg-[#FBF1EF] p-3 text-sm text-[#A45D55]">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173650] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{loading && <LoaderCircle size={17} className="animate-spin"/>}Envoyer le lien</button></form></section></main>;
}
