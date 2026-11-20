"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  Heart,
  Headphones,
  House,
  Plus,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  SprayCan,
  Truck,
  UserRound,
  Watch,
  Sparkles,
  Footprints,
  type LucideIcon,
} from "lucide-react";

type Language = "fr" | "ar";

type CategoryId =
  | "all"
  | "electronics"
  | "fashion"
  | "beauty"
  | "home"
  | "accessories";

type Product = {
  id: string;
  name: string;
  category: Exclude<CategoryId, "all">;
  price: number;
  visual: "one" | "two" | "three" | "four";
  tag: string;
  imageUrl: string | null;
  storeName: string;
};

const categoryIcons: Record<CategoryId, LucideIcon> = {
  all: Sparkles,
  electronics: Smartphone,
  fashion: Shirt,
  beauty: SprayCan,
  home: House,
  accessories: Watch,
};

const productIcons: Record<string, LucideIcon> = {
  1: Smartphone,
  2: ShoppingBag,
  3: Footprints,
  4: Headphones,
  5: Watch,
  6: SprayCan,
  7: ShoppingBag,
  8: House,
};

const translations = {
  fr: {
    announcement: "Bienvenue chez ABBASIA — Votre marché, partout au Tchad",
    search: "Rechercher un produit, une marque...",
    login: "Connexion",
    categories: "Catégories",
    home: "Accueil",
    all: "Tout voir",
    sellers: "Vendeurs",
    offers: "Offres",
    heroLabel: "BIENVENUE SUR ABBASIA",
    heroTitle: "Tout ce qu’il vous faut, au même endroit.",
    heroText:
      "Découvrez une nouvelle façon de faire vos achats. Explorez les boutiques et trouvez vos produits préférés sur ABBASIA.",
    shopNow: "Découvrir les produits",
    explore: "Explorer le marché",
    popular: "Produits populaires",
    popularText: "Découvrez une sélection de produits disponibles sur ABBASIA.",
    viewAll: "Voir tout",
    add: "Ajouter",
    empty: "Aucun produit trouvé.",
    delivery: "Livraison organisée",
    deliveryText: "Des solutions de livraison adaptées à votre ville.",
    secure: "Achats en confiance",
    secureText: "Des vendeurs et commandes suivis.",
    support: "Service client",
    supportText: "Une assistance pour vos achats.",
    footerText: "Votre marché en ligne, simple et accessible.",
    rights: "Tous droits réservés.",
    currency: "FCFA",
    categoriesList: [
      { id: "all" as const, label: "Tout" },
      { id: "electronics" as const, label: "Électronique" },
      { id: "fashion" as const, label: "Mode" },
      { id: "beauty" as const, label: "Beauté" },
      { id: "home" as const, label: "Maison" },
      { id: "accessories" as const, label: "Accessoires" },
    ],
  },
  ar: {
    announcement: "مرحباً بكم في ABBASIA — سوقكم في كل مكان في تشاد",
    search: "ابحث عن منتج أو علامة تجارية...",
    login: "تسجيل الدخول",
    categories: "الفئات",
    home: "الرئيسية",
    all: "عرض الكل",
    sellers: "البائعون",
    offers: "العروض",
    heroLabel: "مرحباً بكم في ABBASIA",
    heroTitle: "كل ما تحتاجه، في مكان واحد.",
    heroText:
      "اكتشف طريقة جديدة للتسوق. تصفح المتاجر واعثر على منتجاتك المفضلة في ABBASIA.",
    shopNow: "اكتشف المنتجات",
    explore: "استكشف السوق",
    popular: "المنتجات الشائعة",
    popularText: "اكتشف مجموعة مختارة من المنتجات على ABBASIA.",
    viewAll: "عرض الكل",
    add: "أضف",
    empty: "لم يتم العثور على منتجات.",
    delivery: "توصيل منظم",
    deliveryText: "حلول توصيل تناسب مدينتك.",
    secure: "تسوق بثقة",
    secureText: "متابعة البائعين والطلبات.",
    support: "خدمة العملاء",
    supportText: "نحن هنا لمساعدتك في التسوق.",
    footerText: "سوقك الإلكتروني، بسيط وسهل الوصول.",
    rights: "جميع الحقوق محفوظة.",
    currency: "فرنك أفريقي",
    categoriesList: [
      { id: "all" as const, label: "الكل" },
      { id: "electronics" as const, label: "الإلكترونيات" },
      { id: "fashion" as const, label: "الأزياء" },
      { id: "beauty" as const, label: "الجمال" },
      { id: "home" as const, label: "المنزل" },
      { id: "accessories" as const, label: "الإكسسوارات" },
    ],
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("fr");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("abbasia-cart") || "[]") as Array<{ quantity?: number }>;
        setCartCount(cart.reduce((sum, item) => sum + Math.max(0, Number(item.quantity) || 0), 0));
      } catch { setCartCount(0); }
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("abbasia-cart-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("abbasia-cart-updated", refresh);
    };
  }, []);

  const addToCart = (product: Product) => {
    try {
      const cart = JSON.parse(localStorage.getItem("abbasia-cart") || "[]") as Array<{id:string;quantity:number;product:Record<string, unknown>}>;
      const found = cart.find((entry) => entry.id === product.id);
      if (found) found.quantity += 1;
      else cart.push({ id: product.id, quantity: 1, product: {
        id: product.id, name: product.name, price: product.price,
        imageUrl: product.imageUrl, storeName: product.storeName,
        isDemo: product.id.startsWith("demo-")
      }});
      localStorage.setItem("abbasia-cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("abbasia-cart-updated"));
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    } catch { /* local storage may be unavailable */ }
  };
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Products unavailable")))
      .then((data) => {
        if (!active) return;
        const categoryMap: Record<string, Exclude<CategoryId, "all">> = {
          electronics: "electronics", fashion: "fashion", beauty: "beauty",
          home: "home", accessories: "accessories",
        };
        const liveProducts: Product[] = (data.products ?? []).map((item: { id: string; name: string; price: number; category: { slug: string }; imageUrl: string | null; seller: { storeName: string } }, index: number) => ({
          id: item.id, name: item.name, price: item.price,
          category: categoryMap[item.category.slug] ?? "accessories",
          visual: (["one", "two", "three", "four"] as const)[index % 4],
          tag: "Disponible", imageUrl: item.imageUrl, storeName: item.seller.storeName,
        }));
        const developmentProducts: Product[] = [
          { id: "demo-smartphone", name: "Smartphone élégant", category: "electronics", price: 185000, visual: "one", tag: "Démo", imageUrl: "/demo-products/smartphone.webp", storeName: "Boutique de démonstration" },
          { id: "demo-handbag", name: "Sac à main classique", category: "fashion", price: 28500, visual: "two", tag: "Démo", imageUrl: "/demo-products/handbag.webp", storeName: "Boutique de démonstration" },
          { id: "demo-headphones", name: "Casque audio sans fil", category: "electronics", price: 42000, visual: "three", tag: "Démo", imageUrl: "/demo-products/headphones.webp", storeName: "Boutique de démonstration" },
          { id: "demo-sneakers", name: "Baskets sport", category: "fashion", price: 35000, visual: "four", tag: "Démo", imageUrl: "/demo-products/sneakers.webp", storeName: "Boutique de démonstration" },
          { id: "demo-serum", name: "Sérum de soin", category: "beauty", price: 12500, visual: "one", tag: "Démo", imageUrl: "/demo-products/serum.webp", storeName: "Boutique de démonstration" },
          { id: "demo-blender", name: "Mixeur multifonction", category: "home", price: 55000, visual: "two", tag: "Démo", imageUrl: "/demo-products/blender.webp", storeName: "Boutique de démonstration" },
        ];
        setProducts(liveProducts.length > 0 ? liveProducts : process.env.NODE_ENV !== "production" ? developmentProducts : []);
      })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setProductsLoading(false); });
    return () => { active = false; };
  }, []);

  const t = translations[language];
  const isArabic = language === "ar";

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "all" || product.category === activeCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLocaleLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search, products]);

  const formatPrice = (price: number) =>
    `${new Intl.NumberFormat("fr-FR").format(price)} ${t.currency}`;

  const toggleFavorite = (id: string) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  return (
    <main dir={isArabic ? "rtl" : "ltr"}>
      <div className="top-strip">{t.announcement}</div>

      <header className="header">
        <div className="site-container">
          <div className="header-main">
            <a href="/" aria-label="ABBASIA.SHOP homepage">
              <Image
                src="/brand/abbasia-logo.png"
                alt="ABBASIA.SHOP"
                width={220}
                height={180}
                priority
                className="brand-logo"
              />
            </a>

            <div className="search-box">
              <Search size={19} color="#9aa1a7" aria-hidden="true" />
              <input
                type="search"
                placeholder={t.search}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label={t.search}
              />
            </div>

            <div
              className="header-actions"
              style={{ display: "flex", alignItems: "center", gap: 9 }}
            >
              <button
                type="button"
                className="icon-button"
                title="Change language"
                aria-label="Change language"
                onClick={() => setLanguage(isArabic ? "fr" : "ar")}
              >
                <Globe2 size={18} />
              </button>

              <Link href="/account" className="icon-button account-button" title={t.login} aria-label={t.login}>
                <UserRound size={19} />
              </Link>

              <Link href="/cart" className="icon-button" title="Shopping cart" aria-label={`Shopping cart: ${cartCount}`}>
                <ShoppingBag size={19} />
                <span className="cart-count">{cartCount}</span>
              </Link>
            </div>
          </div>

          <nav className="category-nav" aria-label="Main navigation">
            <div className="category-list">
              <a className="category-link" href="#home">
                {t.home}
              </a>
              <a className="category-link" href="#categories">
                {t.categories}
              </a>
              <a className="category-link" href="#products">
                {t.all}
              </a>
              <a className="category-link" href="#benefits">
                {t.sellers}
              </a>
              <a className="category-link" href="#products">
                {t.offers}
              </a>
            </div>
          </nav>
        </div>
      </header>

      <section className="hero site-container" id="home">
        <div className="hero-panel">
          <div className="hero-content">
            <span className="eyebrow">{t.heroLabel}</span>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <a href="#products" className="primary-button gold-button">
              {t.shopNow}
              <ArrowRight size={17} />
            </a>
          </div>

          <div className="hero-decoration" aria-hidden="true">
            <span>A</span>
          </div>
        </div>
      </section>

      <section className="section site-container" id="categories">
        <div className="section-heading">
          <div>
            <h2>{t.categories}</h2>
            <p>{t.explore}</p>
          </div>
        </div>

        <div className="category-grid">
          {t.categoriesList.map((category) => {
            const CategoryIcon = categoryIcons[category.id];

            return (
              <button
                type="button"
                key={category.id}
                className={`category-card category-${category.id} ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={activeCategory === category.id}
              >
                <span className="category-icon">
                  <CategoryIcon
                    className="category-art-icon"
                    size={25}
                    strokeWidth={1.65}
                    aria-hidden="true"
                  />
                </span>
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section site-container" id="products">
        <div className="section-heading">
          <div>
            <h2>{t.popular}</h2>
            <p>{t.popularText}</p>
          </div>
          <a className="text-link" href="#products">
            {t.viewAll} <ArrowRight size={14} />
          </a>
        </div>

        <div className="product-grid">
          {productsLoading ? (
            <div className="empty-state">Chargement des produits…</div>
          ) : visibleProducts.length === 0 ? (
            <div className="empty-state">{t.empty}</div>
          ) : (
            visibleProducts.map((product) => {
              const ProductIcon = productIcons[product.id] ?? ShoppingBag;

              return (
                <article className="product-card" key={product.id}>
                  <div className={`product-visual ${product.visual}`}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <ProductIcon className="product-art-icon" size={58} strokeWidth={1.35} aria-hidden="true" />
                    )}

                    <span className="product-tag">{product.tag}</span>

                    <button
                      type="button"
                      className="favorite-button"
                      onClick={() => toggleFavorite(product.id)}
                      aria-label={
                        favorites.includes(product.id)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      aria-pressed={favorites.includes(product.id)}
                    >
                      <Heart
                        size={16}
                        fill={
                          favorites.includes(product.id)
                            ? "#d99b36"
                            : "none"
                        }
                        color={
                          favorites.includes(product.id)
                            ? "#d99b36"
                            : "currentColor"
                        }
                      />
                    </button>
                  </div>

                  <div className="product-info">
                    <span className="product-category">
                      {t.categoriesList.find(
                        (category) => category.id === product.category,
                      )?.label}
                    </span>

                    <h3>{product.name}</h3>

                    <div className="product-price">
                      {formatPrice(product.price)}
                    </div>

                    <div className="product-footer">
                      <button
                        type="button"
                        className="add-button"
                        onClick={() => addToCart(product)}
                      >
                        <Plus size={14} />
                        {t.add}
                      </button>

                      <span style={{ fontSize: 10, color: "#87919a" }}>
                        {product.storeName}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="site-container benefits" id="benefits">
        <div className="benefit-card">
          <div className="benefit-icon">
            <Truck size={21} />
          </div>
          <div>
            <strong>{t.delivery}</strong>
            <span>{t.deliveryText}</span>
          </div>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon">
            <ShieldCheck size={21} />
          </div>
          <div>
            <strong>{t.secure}</strong>
            <span>{t.secureText}</span>
          </div>
        </div>

        <div className="benefit-card">
          <div className="benefit-icon">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <strong>{t.support}</strong>
            <span>{t.supportText}</span>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="site-container">
          <div className="footer-content">
            <div>
              <h3>ABBASIA.SHOP</h3>
              <p>{t.footerText}</p>
              <p>Powered by SAFI Enterprises</p>
              <p><a href="/track" className="underline underline-offset-4">Suivre une commande</a></p>
            </div>

            <div>
              <h3>{t.categories}</h3>
              <p>Abéché · Tchad</p>
              <p>Français / العربية</p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 ABBASIA.SHOP. {t.rights}</span>
            <span>Powered by SAFI Enterprises</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
