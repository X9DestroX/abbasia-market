"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LockKeyhole, LoaderCircle } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/account"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Impossible de modifier le mot de passe."); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#F7F5EF] px-5 py-10 text-[#173650]"><section className="w-full max-w-md rounded-3xl border border-[#E9E3D7] bg-white p-8 shadow-sm sm:p-10"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F4EFE5] text-[#A77D3E]"><LockKeyhole size={22}/></div><h1 className="mt-5 text-2xl font-bold">Nouveau mot de passe</h1><p className="mt-2 text-sm leading-6 text-[#78838D]">Choisissez un nouveau mot de passe sécurisé pour votre compte.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-sm font-medium">Nouveau mot de passe</span><input type="password" required minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-[#E4E5E5] px-4 py-3 outline-none focus:border-[#C6A15B]"/></label><label className="block"><span className="mb-2 block text-sm font-medium">Confirmer le mot de passe</span><input type="password" required minLength={8} value={confirm} onChange={(e)=>setConfirm(e.target.value)} autoComplete="new-password" className="w-full rounded-xl border border-[#E4E5E5] px-4 py-3 outline-none focus:border-[#C6A15B]"/></label>{error && <p role="alert" className="rounded-xl bg-[#FBF1EF] p-3 text-sm text-[#A45D55]">{error}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173650] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{loading && <LoaderCircle size={17} className="animate-spin"/>}Enregistrer le mot de passe</button></form><Link href="/auth" className="mt-6 block text-center text-sm text-[#A77D3E]">Retour à la connexion</Link></section></main>;
}
