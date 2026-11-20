
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

type Language = "fr" | "ar";
type Mode = "login" | "register";

const translations = {
  fr: {
    login: "Connexion",
    register: "Créer un compte",
    welcome: "Bienvenue chez ABBASIA",
    subtitle: "Votre marketplace, tout ce qu'il vous faut au même endroit.",
    name: "Nom complet",
    email: "Adresse e-mail",
    password: "Mot de passe",
    loginButton: "Se connecter",
    registerButton: "Créer mon compte",
    noAccount: "Vous n'avez pas encore de compte ?",
    haveAccount: "Vous avez déjà un compte ?",
    verify: "Votre compte a été créé. Consultez votre boîte e-mail pour confirmer votre adresse.",
    success: "Connexion réussie.",
    forgot: "Mot de passe oublié ?",
    back: "Retour à l'accueil",
    error: "Une erreur est survenue. Veuillez réessayer.",
    required: "Veuillez remplir tous les champs.",
    invalid: "Veuillez saisir une adresse e-mail valide.",
    passwordLength: "Le mot de passe doit contenir au moins 8 caractères.",
    profileError: "Connexion réussie, mais la création de votre profil a échoué. Contactez le support.",
    verificationError: "Le lien de vérification est invalide ou expiré. Réessayez.",
  },
  ar: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    welcome: "مرحباً بكم في ABBASIA",
    subtitle: "سوقكم الإلكتروني، كل ما تحتاجونه في مكان واحد.",
    name: "الاسم الكامل",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    loginButton: "تسجيل الدخول",
    registerButton: "إنشاء حسابي",
    noAccount: "ليس لديك حساب؟",
    haveAccount: "لديك حساب بالفعل؟",
    verify: "تم إنشاء حسابك. يرجى التحقق من بريدك الإلكتروني لتأكيد عنوانك.",
    success: "تم تسجيل الدخول بنجاح.",
    forgot: "نسيت كلمة المرور؟",
    back: "العودة إلى الرئيسية",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
    required: "يرجى ملء جميع الحقول.",
    invalid: "يرجى إدخال بريد إلكتروني صحيح.",
    passwordLength: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
    profileError: "تم تسجيل الدخول، لكن تعذر إنشاء ملفك الشخصي. يرجى الاتصال بالدعم.",
    verificationError: "رابط التحقق غير صالح أو منتهي الصلاحية.",
  },
};

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [language, setLanguage] = useState<Language>("fr");
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const t = translations[language];
  const isArabic = language === "ar";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password || (mode === "register" && !name.trim())) {
      setMessage(t.required);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setMessage(t.invalid);
      return;
    }

    if (password.length < 8) {
      setMessage(t.passwordLength);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          const response = await fetch("/api/auth/profile", {
            method: "POST",
          });

          if (!response.ok) {
            setMessage(t.profileError);
            return;
          }

          router.replace("/account");
          router.refresh();
          return;
        }

        setMessage(t.verify);
        setMode("login");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) throw error;

      const response = await fetch("/api/auth/profile", {
        method: "POST",
      });

      if (!response.ok) {
        await supabase.auth.signOut();
        setMessage(t.profileError);
        return;
      }

      router.replace("/account");
      router.refresh();
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage(
        error instanceof Error ? error.message : t.error
      );
    } finally {
      setLoading(false);
    }
  }

  const queryError = searchParams.get("error");

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F7F5EF] px-5 py-8 text-[#173650]"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ABBASIA<span className="text-[#C6A15B]">.SHOP</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            setLanguage(isArabic ? "fr" : "ar");
            setMessage("");
          }}
          className="rounded-full border border-[#DCD6C8] px-4 py-2 text-sm font-medium"
        >
          {isArabic ? "Français" : "العربية"}
        </button>
      </div>

      <div className="mx-auto grid min-h-[78vh] max-w-6xl items-center gap-12 py-12 md:grid-cols-2">
        <section className="hidden md:block">
          <div className="mb-6 inline-flex rounded-full bg-[#EDE6D8] px-4 py-2 text-sm text-[#806A43]">
            ABBASIA.SHOP · TCHAD
          </div>

          <h1 className="max-w-lg text-5xl font-semibold leading-tight tracking-tight">
            {t.welcome}
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-[#687783]">
            {t.subtitle}
          </p>

          <div className="mt-12 h-1 w-24 rounded-full bg-[#C6A15B]" />
        </section>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-[#E9E3D7] bg-white p-7 shadow-[0_20px_70px_rgba(23,54,80,0.07)] sm:p-10">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[#75818B] hover:text-[#173650]"
          >
            <ArrowLeft size={16} />
            {t.back}
          </Link>

          <h2 className="text-3xl font-semibold tracking-tight">
            {mode === "login" ? t.login : t.register}
          </h2>

          <p className="mt-2 text-sm text-[#78838D]">{t.subtitle}</p>

          {(message || queryError) && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-[#E8DCC2] bg-[#FBF7EF] p-4 text-sm leading-6 text-[#765C2E]"
            >
              {message ||
                (queryError === "profile"
                  ? t.profileError
                  : queryError === "verification"
                    ? t.verificationError
                    : t.error)}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {mode === "register" && (
              <label className="block">
                <span className="mb-2 block text-sm font-medium">
                  {t.name}
                </span>
                <span className="flex items-center gap-3 rounded-xl border border-[#E4E5E5] px-4 py-3 focus-within:border-[#C6A15B]">
                  <UserRound size={18} className="text-[#9A9FA4]" />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    maxLength={100}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder={t.name}
                  />
                </span>
              </label>
            )}

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                {t.email}
              </span>
              <span className="flex items-center gap-3 rounded-xl border border-[#E4E5E5] px-4 py-3 focus-within:border-[#C6A15B]">
                <Mail size={18} className="text-[#9A9FA4]" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="name@example.com"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                {t.password}
              </span>
              <span className="flex items-center gap-3 rounded-xl border border-[#E4E5E5] px-4 py-3 focus-within:border-[#C6A15B]">
                <LockKeyhole size={18} className="text-[#9A9FA4]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="text-[#9A9FA4]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {mode === "login" && (
              <div className="text-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[#A27D3E] hover:underline"
                >
                  {t.forgot}
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#173650] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#234B69] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LoaderCircle size={18} aria-hidden="true" className={loading ? "animate-spin" : "opacity-0"} />
              <span>{mode === "login" ? t.loginButton : t.registerButton}</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#78838D]">
            {mode === "login" ? t.noAccount : t.haveAccount}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
              className="font-semibold text-[#A27D3E] hover:underline"
            >
              {mode === "login" ? t.register : t.login}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
