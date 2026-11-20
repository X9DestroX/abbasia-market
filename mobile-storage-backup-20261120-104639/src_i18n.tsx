
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nManager } from "react-native";
import { getAppStorageItem, setAppStorageItem } from "@/storage";

export type Locale = "fr" | "ar" | "en";

const translations = {
  fr: {
    home: "Accueil",
    categories: "Catégories",
    scanner: "Scanner",
    cart: "Panier",
    account: "Compte",
    search: "Rechercher un produit, une marque...",
    deliver: "Livrer à",
    location: "Abéché, Tchad",
    greeting: "Bienvenue sur ABBASIA",
    hero: "Tout ce qu’il vous faut, au même endroit.",
    heroSub: "Découvrez les boutiques et les meilleurs produits du Tchad.",
    explore: "Explorer le marché",
    popular: "Populaires en ce moment",
    seeAll: "Voir tout",
    deals: "Nos sélections",
    add: "Ajouter",
    added: "Ajouté au panier",
    available: "Disponible",
    empty: "Aucun produit trouvé.",
    loading: "Chargement des produits…",
    retry: "Réessayer",
    searchResults: "Résultats de recherche",
    all: "Tout",
    electronics: "Électronique",
    fashion: "Mode",
    beauty: "Beauté",
    homeCat: "Maison",
    accessories: "Accessoires",
    quick: "Acheter facilement",
    quickSub: "Des produits sélectionnés auprès de vendeurs approuvés.",
    basketEmpty: "Votre panier est vide.",
    total: "Total estimé",
    checkout: "Passer à la commande",
    remove: "Retirer",
    signIn: "Connexion / Inscription",
    signOut: "Se déconnecter",
    signedIn: "Connecté en tant que",
    scannerTitle: "Scanner un produit",
    scannerSub: "Scannez un QR code ou un code-barres pour rechercher un article.",
    permission: "Autoriser la caméra",
    scanAgain: "Scanner à nouveau",
    notFound: "Aucun produit correspondant.",
    found: "Produit trouvé",
    language: "Langue",
    products: "produits",
    stock: "En stock",
    welcomeBack: "Votre marché, à portée de main",
    secure: "Paiement à la livraison",
    accountTitle: "Votre compte ABBASIA",
    noAccount: "Connectez-vous pour gérer vos commandes.",
    price: "Prix",
    store: "Boutique",
    details: "Détails du produit",
    continue: "Continuer vos achats",
    cash: "Paiement à la livraison",
    fullName: "Nom complet",
    phone: "Téléphone",
    city: "Ville",
    address: "Adresse de livraison",
    confirm: "Confirmer la commande",
    emptySearch: "Essayez un autre mot-clé.",
  },

  ar: {
    home: "الرئيسية",
    categories: "الفئات",
    scanner: "الماسح",
    cart: "السلة",
    account: "حسابي",
    search: "ابحث عن منتج أو علامة تجارية...",
    deliver: "التوصيل إلى",
    location: "أبشي، تشاد",
    greeting: "مرحباً بكم في ABBASIA",
    hero: "كل ما تحتاجه، في مكان واحد.",
    heroSub: "اكتشف المتاجر وأفضل المنتجات في تشاد.",
    explore: "استكشف السوق",
    popular: "الأكثر رواجاً",
    seeAll: "عرض الكل",
    deals: "اختياراتنا",
    add: "أضف",
    added: "تمت الإضافة إلى السلة",
    available: "متوفر",
    empty: "لم يتم العثور على منتجات.",
    loading: "جارٍ تحميل المنتجات…",
    retry: "إعادة المحاولة",
    searchResults: "نتائج البحث",
    all: "الكل",
    electronics: "الإلكترونيات",
    fashion: "الأزياء",
    beauty: "الجمال",
    homeCat: "المنزل",
    accessories: "الإكسسوارات",
    quick: "تسوق بسهولة",
    quickSub: "منتجات مختارة من بائعين معتمدين.",
    basketEmpty: "سلة التسوق فارغة.",
    total: "المجموع التقديري",
    checkout: "إتمام الطلب",
    remove: "إزالة",
    signIn: "تسجيل الدخول / إنشاء حساب",
    signOut: "تسجيل الخروج",
    signedIn: "تم تسجيل الدخول باسم",
    scannerTitle: "امسح منتجاً",
    scannerSub: "امسح رمز QR أو الرمز الشريطي للبحث عن منتج.",
    permission: "السماح باستخدام الكاميرا",
    scanAgain: "امسح مرة أخرى",
    notFound: "لم يتم العثور على منتج مطابق.",
    found: "تم العثور على المنتج",
    language: "اللغة",
    products: "منتجات",
    stock: "متوفر",
    welcomeBack: "سوقك بين يديك",
    secure: "الدفع عند الاستلام",
    accountTitle: "حساب ABBASIA الخاص بك",
    noAccount: "سجل الدخول لإدارة طلباتك.",
    price: "السعر",
    store: "المتجر",
    details: "تفاصيل المنتج",
    continue: "متابعة التسوق",
    cash: "الدفع عند الاستلام",
    fullName: "الاسم الكامل",
    phone: "الهاتف",
    city: "المدينة",
    address: "عنوان التوصيل",
    confirm: "تأكيد الطلب",
    emptySearch: "جرّب كلمة بحث أخرى.",
  },

  en: {
    home: "Home",
    categories: "Categories",
    scanner: "Scanner",
    cart: "Cart",
    account: "Account",
    search: "Search products and brands...",
    deliver: "Deliver to",
    location: "Abéché, Chad",
    greeting: "Welcome to ABBASIA",
    hero: "Everything you need, all in one place.",
    heroSub: "Discover stores and great products across Chad.",
    explore: "Explore marketplace",
    popular: "Popular right now",
    seeAll: "See all",
    deals: "Our picks",
    add: "Add",
    added: "Added to cart",
    available: "Available",
    empty: "No products found.",
    loading: "Loading products…",
    retry: "Try again",
    searchResults: "Search results",
    all: "All",
    electronics: "Electronics",
    fashion: "Fashion",
    beauty: "Beauty",
    homeCat: "Home",
    accessories: "Accessories",
    quick: "Shop with ease",
    quickSub: "Curated products from approved sellers.",
    basketEmpty: "Your cart is empty.",
    total: "Estimated total",
    checkout: "Proceed to checkout",
    remove: "Remove",
    signIn: "Sign in / Create account",
    signOut: "Sign out",
    signedIn: "Signed in as",
    scannerTitle: "Scan a product",
    scannerSub: "Scan a QR code or barcode to find an item.",
    permission: "Allow camera",
    scanAgain: "Scan again",
    notFound: "No matching product found.",
    found: "Product found",
    language: "Language",
    products: "products",
    stock: "In stock",
    welcomeBack: "Your marketplace, in your pocket",
    secure: "Cash on delivery",
    accountTitle: "Your ABBASIA account",
    noAccount: "Sign in to manage your orders.",
    price: "Price",
    store: "Store",
    details: "Product details",
    continue: "Continue shopping",
    cash: "Cash on delivery",
    fullName: "Full name",
    phone: "Phone",
    city: "City",
    address: "Delivery address",
    confirm: "Place order",
    emptySearch: "Try another search term.",
  },
} as const;

export type TranslationKey = keyof typeof translations.fr;
export type TranslationSet = {
  readonly [K in TranslationKey]: string;
};

type ContextValue = {
  locale: Locale;
  t: TranslationSet;
  setLocale: (value: Locale) => void;
  isRTL: boolean;
};

const Context = createContext<ContextValue>({
  locale: "fr",
  t: translations.fr,
  setLocale: () => {},
  isRTL: false,
});

const STORAGE_KEY = "abbasia-locale";

export function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadLocale() {
      try {
        const savedLocale = await getAppStorageItem(STORAGE_KEY);

        if (
          mounted &&
          (savedLocale === "fr" ||
            savedLocale === "ar" ||
            savedLocale === "en")
        ) {
          setLocaleState(savedLocale);
        }
      } catch (error) {
        console.warn("Unable to load saved language:", error);
      } finally {
        if (mounted) {
          setIsLoaded(true);
        }
      }
    }

    loadLocale();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const shouldUseRTL = locale === "ar";

    I18nManager.allowRTL(true);

    if (I18nManager.isRTL !== shouldUseRTL) {
      I18nManager.forceRTL(shouldUseRTL);
    }
  }, [locale, isLoaded]);

  const setLocale = (value: Locale) => {
    setLocaleState(value);

    setAppStorageItem(STORAGE_KEY, value).catch((error) => {
      console.warn("Unable to save language:", error);
    });
  };

  const value = useMemo<ContextValue>(
    () => ({
      locale,
      t: translations[locale],
      setLocale,
      isRTL: locale === "ar",
    }),
    [locale]
  );

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}

export function useI18n(): ContextValue {
  return useContext(Context);
}

export function formatPrice(
  value: number,
  locale: Locale
): string {
  const amount = new Intl.NumberFormat(
    locale === "en"
      ? "en-US"
      : locale === "ar"
        ? "ar-TD"
        : "fr-FR",
    {
      maximumFractionDigits: 0,
    }
  ).format(value);

  if (locale === "ar") {
    return `${amount} فرنك سيفا`;
  }

  if (locale === "en") {
    return `${amount} XAF`;
  }

  return `${amount} FCFA`;
}
