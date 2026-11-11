import { useCallback, useEffect, useState } from 'react';
import type { Language, Product, PublicStorefrontData } from './types.ts';
import { fetchStorefront } from './lib/api.ts';
import { pickText } from './lib/i18n.ts';
import { Header, type RouteView } from './components/Header.tsx';
import { HomeView } from './components/HomeView.tsx';
import { ProductsView } from './components/ProductsView.tsx';
import { ProductDetailView } from './components/ProductDetailView.tsx';
import { OrderModal } from './components/OrderModal.tsx';
import { Footer } from './components/Footer.tsx';
import { BeautyAdvisorDrawer } from './components/BeautyAdvisorDrawer.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

function parseRoute(): { view: RouteView; productId: string } {
  const path = window.location.pathname;
  if (path === '/admin' || path.startsWith('/admin/')) {
    return { view: 'admin', productId: '' };
  }
  if (path.startsWith('/product/')) {
    return { view: 'product', productId: decodeURIComponent(path.slice('/product/'.length)) };
  }
  if (path === '/products') {
    return { view: 'products', productId: '' };
  }
  return { view: 'home', productId: '' };
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('elham_lang');
      if (saved === 'ar' || saved === 'tr' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'ar';
  });

  const [route, setRoute] = useState<{ view: RouteView; productId: string }>(parseRoute);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [storefront, setStorefront] = useState<PublicStorefrontData | null>(null);
  const [loadError, setLoadError] = useState('');

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderQty, setOrderQty] = useState(1);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const loadStore = useCallback(async () => {
    try {
      const data = await fetchStorefront();
      setStorefront(data);
      setLoadError('');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load storefront.');
    }
  }, []);

  useEffect(() => {
    void loadStore();
  }, [loadStore]);

  useEffect(() => {
    if (!storefront) return;
    if (window.location.pathname === '/join-team' || window.location.hash === '#join-team') {
      setTimeout(() => {
        document.getElementById('join-team')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  }, [storefront]);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('elham_lang', lang);
    } catch {
      // ignore
    }
    if (storefront) {
      const brand = storefront.settings.brandName || 'ELHAM BEAUTY';
      const subtitle = pickText(storefront.settings.heroSubtitle, lang);
      document.title =
        lang === 'ar'
          ? `${brand} — الهام بيوتي | العطور والتجميل والعناية`
          : lang === 'tr'
          ? `${brand} — Lüks Parfüm ve Güzellik`
          : `${brand} — Luxury Perfumes, Skincare & Beauty`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && subtitle) {
        metaDesc.setAttribute('content', subtitle);
      }
    }
  }, [lang, storefront]);

  function pushPath(path: string, nextRoute: { view: RouteView; productId: string }) {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(nextRoute);
  }

  function navigateHome(sectionId?: string) {
    pushPath('/', { view: 'home', productId: '' });
    setActiveSection(sectionId || 'hero');
    setTimeout(() => {
      if (sectionId && sectionId !== 'hero') {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 60);
  }

  function navigateProducts(categoryId?: string) {
    setSelectedCategoryId(categoryId || '');
    pushPath('/products', { view: 'products', productId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateProduct(productId: string) {
    pushPath(`/product/${encodeURIComponent(productId)}`, {
      view: 'product',
      productId,
    });
  }

  function navigateAdmin() {
    pushPath('/admin', { view: 'admin', productId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (route.view === 'admin') {
    return (
      <AdminDashboard
        lang={lang}
        onChangeLang={setLang}
        onExitAdmin={() => navigateHome('hero')}
        onStoreChanged={loadStore}
      />
    );
  }

  if (!storefront) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="font-display text-2xl font-bold tracking-widest text-[#2A1620]">
          ELHAM BEAUTY
        </div>
        {loadError ? (
          <p className="text-sm text-[#9D2F5A]">{loadError}</p>
        ) : (
          <div className="w-36 h-1 bg-[#FCE8F0] rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[#CC4B7C] animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  const activeProduct =
    route.view === 'product'
      ? storefront.products.find((p) => p.id === route.productId) || null
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2A1620]">
      <Header
        brandName={storefront.settings.brandName}
        lang={lang}
        onChangeLang={setLang}
        onNavigateHome={navigateHome}
        onNavigateProducts={() => navigateProducts('')}
        activeView={route.view}
        activeSection={activeSection}
      />

      <main className="flex-1">
        {route.view === 'products' ? (
          <ProductsView
            categories={storefront.categories}
            products={storefront.products}
            lang={lang}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onSelectProduct={navigateProduct}
            onNavigateAdmin={navigateAdmin}
          />
        ) : route.view === 'product' && activeProduct ? (
          <ProductDetailView
            product={activeProduct}
            categories={storefront.categories}
            allProducts={storefront.products}
            lang={lang}
            onBack={() => navigateProducts(selectedCategoryId)}
            onSelectProduct={navigateProduct}
            onOrderNow={(prod, qty) => {
              setOrderProduct(prod);
              setOrderQty(qty);
              setOrderModalOpen(true);
            }}
          />
        ) : (
          <HomeView
            settings={storefront.settings}
            categories={storefront.categories}
            products={storefront.products}
            offers={storefront.offers}
            reviews={storefront.reviews}
            lang={lang}
            onNavigateProducts={navigateProducts}
            onSelectProduct={navigateProduct}
            onOpenAdvisor={() => setAdvisorOpen(true)}
            onNavigateAdmin={navigateAdmin}
          />
        )}
      </main>

      <Footer
        settings={storefront.settings}
        lang={lang}
        onNavigateHome={navigateHome}
        onNavigateProducts={() => navigateProducts('')}
        onNavigateAdmin={navigateAdmin}
      />

      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        products={storefront.products}
        initialProduct={orderProduct}
        initialQuantity={orderQty}
        storePhone={storefront.settings.phone}
        lang={lang}
      />

      <BeautyAdvisorDrawer
        isOpen={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        lang={lang}
      />
    </div>
  );
}
