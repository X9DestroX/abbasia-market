"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpRight, BadgeCheck, Bell, Check, ChevronDown,
  ClipboardList, Heart, Home, LogOut, MapPin, Menu, Package,
  Plus, Settings, ShieldCheck, ShoppingBag, Store, UserRound, Wallet, X,
} from "lucide-react";

type Section = "overview" | "orders" | "addresses" | "profile" | "favorites" | "security";
type Profile = { id: string; name: string; email: string | null; phone: string | null; role: string; createdAt: string };
type Address = { id: string; fullName: string; phone: string; city: string; district: string | null; addressLine: string; instructions: string | null; isDefault: boolean };
type Order = { id: string; orderNumber: string; status: string; total: number; currency: string; createdAt: string; sellerCount: number };

const copy = {
  fr: {
    dashboard: "Mon espace", overview: "Vue d'ensemble", orders: "Mes commandes", addresses: "Mes adresses", profile: "Mon profil", favorites: "Favoris", security: "Sécurité", welcome: "Bonjour", subtitle: "Retrouvez ici les informations de votre compte et vos activités.",
    totalOrders: "Commandes", savedAddresses: "Adresses enregistrées", account: "Compte client", recentOrders: "Commandes récentes", seeAll: "Tout voir", noOrders: "Vous n'avez pas encore passé de commande.", shop: "Découvrir la boutique", order: "Commande", date: "Date", amount: "Montant", status: "Statut", delivery: "Livraison", addressTitle: "Adresses de livraison", addAddress: "Ajouter une adresse", noAddresses: "Aucune adresse enregistrée.", default: "Principale", name: "Nom complet", phone: "Téléphone", city: "Ville", district: "Quartier", addressLine: "Adresse détaillée", instructions: "Instructions (facultatif)", save: "Enregistrer", cancel: "Annuler", profileTitle: "Informations personnelles", email: "Adresse e-mail", role: "Type de compte", memberSince: "Membre depuis", editProfile: "Modifier le profil", saveChanges: "Enregistrer les modifications", favoritesTitle: "Vos favoris", favoritesInfo: "Votre liste de favoris sera disponible dès que vous commencerez à enregistrer des produits depuis la boutique.", securityTitle: "Sécurité du compte", securityInfo: "Votre mot de passe et vos sessions sont gérés de manière sécurisée par Supabase.", resetPassword: "Réinitialiser le mot de passe", signOut: "Se déconnecter", backHome: "Retour à la boutique", customer: "Client", seller: "Vendeur", admin: "Administrateur", superAdmin: "Super Admin", saved: "Modifications enregistrées.", failed: "Une erreur est survenue. Veuillez réessayer.", added: "Adresse ajoutée.",
    pending: "En attente", confirmed: "Confirmée", processing: "En préparation", shipped: "Expédiée", delivered: "Livrée", cancelled: "Annulée", paid: "Payée", assigned: "Affectée", picked: "Récupérée", transit: "En transit", failedDelivery: "Échec de livraison", unknown: "Statut inconnu", language: "Langue", french: "Français", arabic: "العربية", addressRequired: "Veuillez remplir les champs obligatoires.",
  },
  ar: {
    dashboard: "حسابي", overview: "نظرة عامة", orders: "طلباتي", addresses: "عناويني", profile: "ملفي الشخصي", favorites: "المفضلة", security: "الأمان", welcome: "مرحباً", subtitle: "يمكنك متابعة معلومات حسابك ونشاطك من هنا.",
    totalOrders: "الطلبات", savedAddresses: "العناوين المحفوظة", account: "حساب عميل", recentOrders: "الطلبات الأخيرة", seeAll: "عرض الكل", noOrders: "لم تقم بأي طلب بعد.", shop: "اكتشف المتجر", order: "الطلب", date: "التاريخ", amount: "المبلغ", status: "الحالة", delivery: "التوصيل", addressTitle: "عناوين التوصيل", addAddress: "إضافة عنوان", noAddresses: "لا توجد عناوين محفوظة.", default: "الرئيسي", name: "الاسم الكامل", phone: "الهاتف", city: "المدينة", district: "الحي", addressLine: "العنوان بالتفصيل", instructions: "تعليمات (اختياري)", save: "حفظ", cancel: "إلغاء", profileTitle: "المعلومات الشخصية", email: "البريد الإلكتروني", role: "نوع الحساب", memberSince: "عضو منذ", editProfile: "تعديل الملف الشخصي", saveChanges: "حفظ التغييرات", favoritesTitle: "المفضلة", favoritesInfo: "ستظهر المنتجات المفضلة هنا عند حفظها من المتجر.", securityTitle: "أمان الحساب", securityInfo: "تتم إدارة كلمة المرور والجلسات بأمان عبر Supabase.", resetPassword: "إعادة تعيين كلمة المرور", signOut: "تسجيل الخروج", backHome: "العودة إلى المتجر", customer: "عميل", seller: "بائع", admin: "مدير", superAdmin: "مدير عام", saved: "تم حفظ التغييرات.", failed: "حدث خطأ. يرجى المحاولة مجدداً.", added: "تمت إضافة العنوان.",
    pending: "قيد الانتظار", confirmed: "مؤكد", processing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى", paid: "مدفوع", assigned: "تم التعيين", picked: "تم الاستلام", transit: "في الطريق", failedDelivery: "تعذر التسليم", unknown: "حالة غير معروفة", language: "اللغة", french: "Français", arabic: "العربية", addressRequired: "يرجى ملء الحقول المطلوبة.",
  },
};

const statusKeys: Record<string, keyof typeof copy.fr> = {
  PENDING: "pending", CONFIRMED: "confirmed", PROCESSING: "processing", SHIPPED: "shipped", DELIVERED: "delivered", CANCELLED: "cancelled", PAID: "paid", ASSIGNED: "assigned", PICKED_UP: "picked", IN_TRANSIT: "transit", FAILED: "failedDelivery",
};

export default function AccountDashboard({ profile: initialProfile, addresses: initialAddresses, orders, counts }: { profile: Profile; addresses: Address[]; orders: Order[]; counts: { orders: number; addresses: number } }) {
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const [section, setSection] = useState<Section>("overview");
  const [profile, setProfile] = useState(initialProfile);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [editingProfile, setEditingProfile] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: profile.name, phone: profile.phone ?? "" });
  const [addressForm, setAddressForm] = useState({ fullName: profile.name, phone: profile.phone ?? "", city: "Abéché", district: "", addressLine: "", instructions: "", isDefault: addresses.length === 0 });
  const t = copy[lang];
  const rtl = lang === "ar";
  const initials = useMemo(() => profile.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), [profile.name]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/auth/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileForm) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.failed);
      setProfile((old) => ({ ...old, name: data.profile.name, phone: data.profile.phone }));
      setEditingProfile(false); setNotice(t.saved);
    } catch { setNotice(t.failed); } finally { setBusy(false); }
  }

  async function addAddress(event: React.FormEvent) {
    event.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.city.trim() || !addressForm.addressLine.trim()) { setNotice(t.addressRequired); return; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addressForm) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t.failed);
      setAddresses((old) => addressForm.isDefault ? [data.address, ...old.map((a) => ({ ...a, isDefault: false }))] : [...old, data.address]);
      setAddingAddress(false); setNotice(t.added);
      setAddressForm({ fullName: profile.name, phone: profile.phone ?? "", city: "Abéché", district: "", addressLine: "", instructions: "", isDefault: false });
    } catch { setNotice(t.failed); } finally { setBusy(false); }
  }

  const navItems: { id: Section; label: string; icon: typeof Home }[] = [
    { id: "overview", label: t.overview, icon: Home }, { id: "orders", label: t.orders, icon: Package }, { id: "addresses", label: t.addresses, icon: MapPin }, { id: "profile", label: t.profile, icon: UserRound }, { id: "favorites", label: t.favorites, icon: Heart }, { id: "security", label: t.security, icon: ShieldCheck },
  ];
  const title = navItems.find((item) => item.id === section)?.label ?? t.dashboard;
  const roleLabel = profile.role === "SUPER_ADMIN" ? t.superAdmin : profile.role === "ADMIN" ? t.admin : profile.role === "SELLER" ? t.seller : t.customer;
  const statusLabel = (value: string) => t[statusKeys[value] ?? "unknown"];
  const formatDate = (value: string) => new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "ar", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
  const money = (value: number, currency: string) => `${new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "ar", { maximumFractionDigits: 0 }).format(value)} ${currency}`;

  return (
    <main dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-[#F6F4EE] text-[#173650]">
      <header className="sticky top-0 z-30 border-b border-[#E9E3D7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileNav(!mobileNav)} className="rounded-xl border border-[#E9E3D7] p-2 lg:hidden" aria-label="Menu"><Menu size={19}/></button>
            <Link href="/" className="text-[21px] font-extrabold tracking-tight">ABBASIA<span className="text-[#C6A15B]">.SHOP</span></Link>
            <span className="hidden h-7 w-px bg-[#E9E3D7] sm:block" />
            <span className="hidden text-sm text-[#7D8790] sm:block">{t.dashboard}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(rtl ? "fr" : "ar")} className="rounded-full border border-[#E4DED2] px-3 py-2 text-xs font-semibold hover:border-[#C6A15B]">{rtl ? "Français" : "العربية"}</button>
            <Link href="/" className="hidden items-center gap-2 text-sm font-medium text-[#647482] hover:text-[#173650] sm:flex"><ArrowLeft size={16}/>{t.backHome}</Link><Link href="/account/orders" className="hidden rounded-lg bg-[#173650] px-3 py-2 text-xs font-semibold text-white sm:flex">Gestion des commandes</Link>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#EDE5D7] text-sm font-bold text-[#876A3D]">{initials}</div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8 lg:px-10 lg:py-9">
        <aside className={`${mobileNav ? "block" : "hidden"} lg:block`}>
          <div className="rounded-2xl border border-[#E9E3D7] bg-white p-5">
            <div className="flex items-center gap-3 border-b border-[#F0ECE4] pb-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EDE5D7] text-base font-bold text-[#876A3D]">{initials}</div>
              <div className="min-w-0"><p className="truncate text-sm font-bold">{profile.name}</p><p className="truncate text-xs text-[#89939B]">{profile.email}</p></div>
            </div>
            <div className="mt-4 mb-3">
              <Link href={profile.role === "SELLER" ? "/seller" : ["ADMIN", "SUPER_ADMIN"].includes(profile.role) ? "/admin/sellers" : "/seller/apply"} className="flex w-full items-center gap-3 rounded-xl border border-[#E8DFC9] bg-[#FCFBF8] px-3 py-3 text-sm font-semibold text-[#94703C] hover:border-[#C6A15B]">
                <Store size={18}/><span>{profile.role === "SELLER" ? (lang === "fr" ? "Espace vendeur" : "مساحة البائع") : ["ADMIN", "SUPER_ADMIN"].includes(profile.role) ? (lang === "fr" ? "Administration" : "الإدارة") : (lang === "fr" ? "Devenir vendeur" : "كن بائعاً")}</span><ArrowUpRight size={15} className="ms-auto"/>
              </Link>
            </div>
            <nav className="mt-4 space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setSection(id); setMobileNav(false); setNotice(""); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-medium transition ${section === id ? "bg-[#173650] text-white shadow-sm" : "text-[#647482] hover:bg-[#F7F5EF] hover:text-[#173650]"}`}><Icon size={18} strokeWidth={1.8}/><span className="flex-1">{label}</span>{id === "orders" && counts.orders > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] ${section === id ? "bg-white/15" : "bg-[#F0ECE4]"}`}>{counts.orders}</span>}</button>
              ))}
            </nav>
            <div className="mt-5 border-t border-[#F0ECE4] pt-4">
              <form action="/auth/signout" method="post"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#A45D55] hover:bg-[#FBF1EF]"><LogOut size={18}/>{t.signOut}</button></form>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-[#173650] p-5 text-white">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><BadgeCheck size={19} className="text-[#D8B977]"/></div>
            <p className="text-sm font-semibold">ABBASIA.SHOP</p><p className="mt-1 text-xs leading-5 text-white/65">{roleLabel}</p>
            <Link href="/" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#E0C58E]">{t.shop}<ArrowUpRight size={14}/></Link>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B18A4E]">ABBASIA.SHOP · {t.dashboard}</p><h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{section === "overview" ? `${t.welcome}, ${profile.name.split(" ")[0]}` : title}</h1><p className="mt-2 text-sm text-[#7D8992]">{section === "overview" ? t.subtitle : title}</p></div>
            <div className="hidden items-center gap-2 rounded-full border border-[#E9E3D7] bg-white px-3 py-2 text-xs text-[#77838D] sm:flex"><span className="h-2 w-2 rounded-full bg-[#6D9A79]"/>{roleLabel}</div>
          </div>

          {notice && <div role="status" className="mb-5 flex items-center justify-between rounded-xl border border-[#DCE9DD] bg-[#F1F7F0] px-4 py-3 text-sm text-[#426A4B]"><span className="flex items-center gap-2"><Check size={16}/>{notice}</span><button onClick={() => setNotice("")} aria-label="Close"><X size={16}/></button></div>}

          {section === "overview" && <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard icon={ShoppingBag} label={t.totalOrders} value={String(counts.orders)} detail={t.recentOrders}/>
              <StatCard icon={MapPin} label={t.savedAddresses} value={String(counts.addresses)} detail={t.delivery}/>
              <StatCard icon={ShieldCheck} label={t.account} value={roleLabel} detail={t.security}/>
            </div>
            <div className="mt-6 rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-base font-bold">{t.recentOrders}</h2><p className="mt-1 text-xs text-[#8A949C]">{t.orders}</p></div><button onClick={() => setSection("orders")} className="text-xs font-bold text-[#A77D3E] hover:underline">{t.seeAll}</button></div>
              <OrderList orders={orders.slice(0, 4)} t={t} statusLabel={statusLabel} formatDate={formatDate} money={money}/>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <button onClick={() => setSection("addresses")} className="flex items-center justify-between rounded-2xl border border-[#E9E3D7] bg-white p-5 text-start hover:border-[#D3B77E]"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4EFE5] text-[#A77D3E]"><MapPin size={19}/></span><span><strong className="block text-sm">{t.addressTitle}</strong><small className="mt-1 block text-xs text-[#8A949C]">{t.savedAddresses}</small></span></span><ArrowUpRight size={17}/></button>
              <button onClick={() => setSection("profile")} className="flex items-center justify-between rounded-2xl border border-[#E9E3D7] bg-white p-5 text-start hover:border-[#D3B77E]"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F4EFE5] text-[#A77D3E]"><UserRound size={19}/></span><span><strong className="block text-sm">{t.profileTitle}</strong><small className="mt-1 block text-xs text-[#8A949C]">{t.editProfile}</small></span></span><ArrowUpRight size={17}/></button>
            </div>
          </>}

          {section === "orders" && <div className="rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-6"><div className="mb-5"><h2 className="font-bold">{t.orders}</h2><p className="mt-1 text-xs text-[#8A949C]">{counts.orders} {t.totalOrders.toLowerCase()}</p></div><OrderList orders={orders} t={t} statusLabel={statusLabel} formatDate={formatDate} money={money}/>{counts.orders > orders.length && <p className="mt-4 text-xs text-[#8A949C]">{lang === "fr" ? "Affichage des 5 commandes les plus récentes." : "يتم عرض أحدث خمسة طلبات."}</p>}</div>}

          {section === "addresses" && <div className="rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">{t.addressTitle}</h2><p className="mt-1 text-xs text-[#8A949C]">{t.savedAddresses}</p></div><button onClick={() => setAddingAddress(!addingAddress)} className="inline-flex items-center gap-2 rounded-xl bg-[#173650] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#244C69]"><Plus size={15}/>{t.addAddress}</button></div>
            {addingAddress && <form onSubmit={addAddress} className="mb-6 grid gap-3 rounded-xl border border-[#E9E3D7] bg-[#FCFBF8] p-4 sm:grid-cols-2">
              <Field label={t.name} value={addressForm.fullName} onChange={(v) => setAddressForm({...addressForm, fullName:v})}/><Field label={t.phone} value={addressForm.phone} onChange={(v) => setAddressForm({...addressForm, phone:v})}/><Field label={t.city} value={addressForm.city} onChange={(v) => setAddressForm({...addressForm, city:v})}/><Field label={t.district} value={addressForm.district} onChange={(v) => setAddressForm({...addressForm, district:v})}/><div className="sm:col-span-2"><Field label={t.addressLine} value={addressForm.addressLine} onChange={(v) => setAddressForm({...addressForm, addressLine:v})}/></div><div className="sm:col-span-2"><Field label={t.instructions} value={addressForm.instructions} onChange={(v) => setAddressForm({...addressForm, instructions:v})}/></div><label className="flex items-center gap-2 text-xs text-[#657581] sm:col-span-2"><input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({...addressForm,isDefault:e.target.checked})}/>{lang === "fr" ? "Définir comme adresse principale" : "تعيين كعنوان رئيسي"}</label><div className="flex gap-2 sm:col-span-2"><button disabled={busy} className="rounded-lg bg-[#173650] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{busy ? "…" : t.save}</button><button type="button" onClick={() => setAddingAddress(false)} className="rounded-lg border border-[#E5DFD4] px-4 py-2 text-xs">{t.cancel}</button></div>
            </form>}
            {addresses.length === 0 ? <EmptyState text={t.noAddresses}/> : <div className="grid gap-3 md:grid-cols-2">{addresses.map((address) => <div key={address.id} className="rounded-xl border border-[#EEE9E0] p-4"><div className="mb-3 flex items-center justify-between"><span className="flex items-center gap-2 text-sm font-bold"><MapPin size={16} className="text-[#B18A4E]"/>{address.city}</span>{address.isDefault && <span className="rounded-full bg-[#F5EFE3] px-2.5 py-1 text-[10px] font-semibold text-[#94703C]">{t.default}</span>}</div><p className="text-sm font-medium">{address.fullName}</p><p className="mt-1 text-xs text-[#75828C]">{address.phone}</p><p className="mt-2 text-xs leading-5 text-[#75828C]">{address.addressLine}{address.district ? `, ${address.district}` : ""}</p></div>)}</div>}
          </div>}

          {section === "profile" && <div className="rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-6"><div className="mb-6 flex items-center justify-between gap-3"><div><h2 className="font-bold">{t.profileTitle}</h2><p className="mt-1 text-xs text-[#8A949C]">{t.editProfile}</p></div><button onClick={() => {setEditingProfile(!editingProfile);setProfileForm({name:profile.name,phone:profile.phone??""});}} className="rounded-lg border border-[#E5DFD4] px-3 py-2 text-xs font-semibold">{editingProfile ? t.cancel : t.editProfile}</button></div>
            {editingProfile ? <form onSubmit={saveProfile} className="grid max-w-xl gap-4"><Field label={t.name} value={profileForm.name} onChange={(v)=>setProfileForm({...profileForm,name:v})}/><Field label={t.phone} value={profileForm.phone} onChange={(v)=>setProfileForm({...profileForm,phone:v})}/><button disabled={busy} className="w-fit rounded-xl bg-[#173650] px-5 py-3 text-xs font-semibold text-white disabled:opacity-60">{busy ? "…" : t.saveChanges}</button></form> : <div className="grid gap-5 sm:grid-cols-2"><Info label={t.name} value={profile.name}/><Info label={t.email} value={profile.email ?? "—"}/><Info label={t.phone} value={profile.phone ?? "—"}/><Info label={t.role} value={roleLabel}/><Info label={t.memberSince} value={formatDate(profile.createdAt)}/></div>}
          </div>}

          {section === "favorites" && <div className="rounded-2xl border border-[#E9E3D7] bg-white px-6 py-14 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F5EFE7] text-[#B18A4E]"><Heart size={25}/></div><h2 className="mt-4 font-bold">{t.favoritesTitle}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#849099]">{t.favoritesInfo}</p><Link href="/" className="mt-5 inline-flex rounded-xl bg-[#173650] px-5 py-3 text-xs font-semibold text-white">{t.shop}</Link></div>}

          {section === "security" && <div className="rounded-2xl border border-[#E9E3D7] bg-white p-5 sm:p-6"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#F2F5F7] text-[#54758D]"><ShieldCheck size={22}/></div><div><h2 className="font-bold">{t.securityTitle}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#849099]">{t.securityInfo}</p><Link href="/auth/forgot-password" className="mt-5 inline-flex rounded-xl border border-[#E5DFD4] px-4 py-3 text-xs font-semibold text-[#173650] hover:border-[#C6A15B]">{t.resetPassword}</Link></div></div></div>}
        </section>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value, detail }: { icon: typeof Home; label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-[#E9E3D7] bg-white p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#849099]">{label}</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F5EFE5] text-[#A77D3E]"><Icon size={18}/></span></div><p className="mt-4 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-[11px] text-[#9AA2A8]">{detail}</p></div>;
}
function OrderList({ orders, t, statusLabel, formatDate, money }: { orders: Order[]; t: typeof copy.fr; statusLabel: (v:string)=>string; formatDate:(v:string)=>string; money:(v:number,c:string)=>string }) {
  if (!orders.length) return <div className="py-10 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#F5EFE5] text-[#A77D3E]"><Package size={22}/></div><p className="mt-3 text-sm text-[#849099]">{t.noOrders}</p><Link href="/" className="mt-4 inline-flex text-xs font-bold text-[#A77D3E]">{t.shop}<ArrowUpRight size={14}/></Link></div>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-start"><thead><tr className="border-b border-[#F0ECE4] text-[11px] text-[#929CA4]"><th className="pb-3 text-start font-medium">{t.order}</th><th className="pb-3 text-start font-medium">{t.date}</th><th className="pb-3 text-start font-medium">{t.amount}</th><th className="pb-3 text-start font-medium">{t.status}</th></tr></thead><tbody>{orders.map((order)=><tr key={order.id} className="border-b border-[#F5F2EC] last:border-0"><td className="py-4 text-xs font-bold">#{order.orderNumber}</td><td className="py-4 text-xs text-[#78858F]">{formatDate(order.createdAt)}</td><td className="py-4 text-xs font-semibold">{money(order.total,order.currency)}</td><td className="py-4"><span className="rounded-full bg-[#F5F1E9] px-2.5 py-1 text-[10px] font-semibold text-[#8B7047]">{statusLabel(order.status)}</span></td></tr>)}</tbody></table></div>;
}
function Field({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) { return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[#647482]">{label}</span><input value={value} onChange={(e)=>onChange(e.target.value)} className="w-full rounded-xl border border-[#E5E1D8] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#C6A15B]" /></label>; }
function Info({ label, value }: { label:string; value:string }) { return <div className="border-b border-[#F0ECE4] pb-3"><p className="text-[11px] text-[#929CA4]">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>; }
function EmptyState({ text }: { text:string }) { return <div className="rounded-xl border border-dashed border-[#E5DFD4] py-12 text-center text-sm text-[#8A949C]">{text}</div>; }
