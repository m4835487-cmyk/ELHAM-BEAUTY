import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  FolderOpen,
  KeyRound,
  LogOut,
  Mail,
  MessageSquare,
  Package,
  Pencil,
  Percent,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import type {
  AdminDashboardData,
  Category,
  Language,
  LocalizedList,
  LocalizedText,
  Offer,
  OrderStatus,
  Product,
  Review,
  SiteSettings,
  TeamApplicationStatus,
} from '../../types.ts';
import {
  UI_STRINGS,
  cleanPhoneForWhatsApp,
  formatTRY,
  getStatusLabel,
  getTeamStatusLabel,
  pickText,
} from '../../lib/i18n.ts';
import {
  changeAdminPassword,
  createCategory,
  createOffer,
  createProduct,
  createReview,
  deleteCategory,
  deleteOffer,
  deleteOrder,
  deleteProduct,
  deleteReview,
  deleteSubscriber,
  deleteTeamApplication,
  fetchAdminAuthStatus,
  fetchAdminDashboard,
  generateAdminCopy,
  getStoredAdminToken,
  loginAdmin,
  setStoredAdminToken,
  setupAdminPassword,
  updateCategory,
  updateOffer,
  updateOrderStatus,
  updateProduct,
  updateReview,
  updateSettings,
  updateTeamApplicationStatus,
} from '../../lib/api.ts';
import { SafeImage } from '../SafeImage.tsx';
import {
  AiAssistBadge,
  ConfirmDeleteButton,
  LocalizedInput,
  MultiImageField,
  SingleImageField,
} from './AdminHelpers.tsx';

type AdminTab =
  | 'products'
  | 'categories'
  | 'offers'
  | 'reviews'
  | 'siteTexts'
  | 'settings'
  | 'orders'
  | 'teamApplications'
  | 'subscribers';

interface AdminDashboardProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onExitAdmin: () => void;
  onStoreChanged: () => Promise<void>;
}

const emptyText = (): LocalizedText => ({ ar: '', tr: '', en: '' });
const emptyList = (): LocalizedList => ({ ar: [], tr: [], en: [] });

export function AdminDashboard({
  lang,
  onChangeLang,
  onExitAdmin,
  onStoreChanged,
}: AdminDashboardProps) {
  const [authChecking, setAuthChecking] = useState(true);
  const [hasPasswordConfigured, setHasPasswordConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [toast, setToast] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  const t = UI_STRINGS[lang].admin;
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function loadDashboard() {
    const snap = await fetchAdminDashboard();
    setData(snap);
  }

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const status = await fetchAdminAuthStatus();
        if (!active) return;
        setHasPasswordConfigured(status.hasPasswordConfigured);
        const token = getStoredAdminToken();
        if (token && status.hasPasswordConfigured) {
          try {
            const snap = await fetchAdminDashboard();
            if (!active) return;
            setData(snap);
            setAuthenticated(true);
          } catch {
            setStoredAdminToken(null);
            setAuthenticated(false);
          }
        }
      } catch (err) {
        if (active) setErrorBanner(err instanceof Error ? err.message : 'Init failed');
      } finally {
        if (active) setAuthChecking(false);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);

  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault();
    setAuthError('');
    if (!hasPasswordConfigured) {
      if (passwordInput.trim().length < 6) {
        setAuthError(
          lang === 'ar'
            ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل'
            : lang === 'tr'
            ? 'Şifre en az 6 karakter olmalıdır'
            : 'Password must be at least 6 characters'
        );
        return;
      }
      if (passwordInput !== confirmPasswordInput) {
        setAuthError(
          lang === 'ar'
            ? 'كلمتا المرور غير متطابقتين'
            : lang === 'tr'
            ? 'Şifreler eşleşmiyor'
            : 'Passwords do not match'
        );
        return;
      }
      setAuthBusy(true);
      try {
        const res = await setupAdminPassword(passwordInput.trim());
        setStoredAdminToken(res.token);
        setHasPasswordConfigured(true);
        await loadDashboard();
        setAuthenticated(true);
        setPasswordInput('');
        setConfirmPasswordInput('');
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Setup failed');
      } finally {
        setAuthBusy(false);
      }
    } else {
      setAuthBusy(true);
      try {
        const res = await loginAdmin(passwordInput);
        setStoredAdminToken(res.token);
        await loadDashboard();
        setAuthenticated(true);
        setPasswordInput('');
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setAuthBusy(false);
      }
    }
  }

  function handleLogout() {
    setStoredAdminToken(null);
    setAuthenticated(false);
    setData(null);
  }

  async function syncData(next: AdminDashboardData) {
    setData(next);
    showToast(t.actions.savedToast);
    await onStoreChanged();
  }

  // Auth Gate Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#FFF7FA] flex items-center justify-center p-6">
        <div className="text-sm text-[#6E515E]">...</div>
      </div>
    );
  }

  if (!authenticated || !data) {
    return (
      <div className="min-h-screen bg-[#FFF7FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#F4DAE4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs font-medium text-[#6E515E] hover:text-[#CC4B7C] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <BackIcon className="w-3.5 h-3.5" />
              <span>{t.backToStore}</span>
            </button>

            <div className="flex items-center gap-1 bg-[#FFF7FA] border border-[#F4DAE4] rounded-lg p-0.5">
              {(['ar', 'tr', 'en'] as Language[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-md cursor-pointer ${
                    lang === code ? 'bg-[#CC4B7C] text-white' : 'text-[#6E515E]'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FCE8F0] text-[#CC4B7C] mx-auto flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#2A1620]">
              {hasPasswordConfigured ? t.gateTitle : t.setupTitle}
            </h1>
            <p className="text-sm text-[#6E515E]">
              {hasPasswordConfigured ? t.loginSubtitle : t.setupSubtitle}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C]"
              />
            </div>

            {!hasPasswordConfigured && (
              <div>
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.confirmPasswordLabel}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C]"
                />
              </div>
            )}

            {authError && (
              <div className="p-3 bg-[#FFF7FA] border border-[#CC4B7C] rounded-lg text-xs text-[#9D2F5A]">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authBusy}
              className="w-full min-h-[46px] bg-[#CC4B7C] hover:bg-[#B43A69] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {hasPasswordConfigured ? t.loginButton : t.setupButton}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: AdminTab; label: string; icon: typeof Package; badge?: number }> = [
    { id: 'products', label: t.tabs.products, icon: Package, badge: data.products.length },
    { id: 'categories', label: t.tabs.categories, icon: FolderOpen, badge: data.categories.length },
    { id: 'offers', label: t.tabs.offers, icon: Percent, badge: data.offers.length },
    { id: 'reviews', label: t.tabs.reviews, icon: MessageSquare, badge: data.reviews.length },
    { id: 'siteTexts', label: t.tabs.siteTexts, icon: FileText },
    { id: 'settings', label: t.tabs.settings, icon: KeyRound },
    { id: 'orders', label: t.tabs.orders, icon: ShoppingBag, badge: data.orders.length },
    {
      id: 'teamApplications',
      label: t.tabs.teamApplications,
      icon: Users,
      badge: data.teamApplications.length,
    },
    { id: 'subscribers', label: t.tabs.subscribers, icon: Mail, badge: data.subscribers.length },
  ];

  return (
    <div className="min-h-screen bg-[#FFF7FA] text-[#2A1620] flex flex-col">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#F4DAE4] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExitAdmin}
            className="min-h-[38px] px-3 py-1.5 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] rounded-lg text-xs font-medium text-[#2A1620] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <BackIcon className="w-3.5 h-3.5 text-[#CC4B7C]" />
            <span className="hidden sm:inline">{t.backToStore}</span>
          </button>
          <span className="font-display text-lg sm:text-xl font-bold text-[#2A1620] whitespace-nowrap">
            {t.gateTitle}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {toast && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-[#FCE8F0] text-[#9D2F5A] text-xs font-medium rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{toast}</span>
            </div>
          )}

          <div className="flex items-center p-0.5 bg-[#FFF7FA] border border-[#F4DAE4] rounded-lg">
            {(['ar', 'tr', 'en'] as Language[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => onChangeLang(code)}
                className={`px-2 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  lang === code ? 'bg-[#CC4B7C] text-white' : 'text-[#6E515E]'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-[#FFF7FA] border border-[#F4DAE4] rounded-lg text-xs font-medium text-[#6E515E] hover:text-[#9D2F5A] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white border border-[#F4DAE4] rounded-2xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-22">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setErrorBanner('');
                }}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#CC4B7C] text-white'
                    : 'text-[#6E515E] hover:bg-[#FFF7FA] hover:text-[#2A1620]'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {typeof item.badge === 'number' && (
                  <span
                    className={`text-xs tabular-nums ${
                      active ? 'text-white/90' : 'text-[#9D2F5A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Workspace */}
        <main className="lg:col-span-9 space-y-6 min-w-0">
          {errorBanner && (
            <div className="p-3.5 bg-white border border-[#CC4B7C] rounded-xl text-xs text-[#9D2F5A]">
              {errorBanner}
            </div>
          )}
          {toast && (
            <div className="md:hidden p-3 bg-white border border-[#F4DAE4] rounded-xl text-xs font-medium text-[#9D2F5A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#CC4B7C]" />
              <span>{toast}</span>
            </div>
          )}

          {activeTab === 'products' && (
            <ProductsManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'offers' && (
            <OffersManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'siteTexts' && (
            <SiteTextsAndBannersManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'settings' && (
            <ContactAndSecurityManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onTokenRefresh={(tok) => setStoredAdminToken(tok)}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'teamApplications' && (
            <TeamApplicationsManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
            />
          )}

          {activeTab === 'subscribers' && (
            <SubscribersManager
              data={data}
              lang={lang}
              onSaved={syncData}
              onError={setErrorBanner}
              onToast={showToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------- 1. PRODUCTS MANAGER ---------------- */
function ProductsManager({
  data,
  lang,
  onSaved,
  onError,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id || '');
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState<LocalizedText>(emptyText());
  const [description, setDescription] = useState<LocalizedText>(emptyText());
  const [featuresText, setFeaturesText] = useState<LocalizedText>(emptyText());
  const [howToUse, setHowToUse] = useState<LocalizedText>(emptyText());
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isLatest, setIsLatest] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [saving, setSaving] = useState(false);

  const [aiBrief, setAiBrief] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  function resetForm() {
    setEditingId(null);
    setCategoryId(data.categories[0]?.id || '');
    setImages([]);
    setName(emptyText());
    setDescription(emptyText());
    setFeaturesText(emptyText());
    setHowToUse(emptyText());
    setPrice('');
    setOriginalPrice('');
    setIsBestSeller(false);
    setIsLatest(true);
    setInStock(true);
    setAiBrief('');
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setCategoryId(p.categoryId || data.categories[0]?.id || '');
    setImages(p.images);
    setName(p.name);
    setDescription(p.description);
    setFeaturesText({
      ar: p.features.ar.join('\n'),
      tr: p.features.tr.join('\n'),
      en: p.features.en.join('\n'),
    });
    setHowToUse(p.howToUse);
    setPrice(String(p.price));
    setOriginalPrice(p.originalPrice ? String(p.originalPrice) : '');
    setIsBestSeller(p.isBestSeller);
    setIsLatest(p.isLatest);
    setInStock(p.inStock);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleAiDraft() {
    const seed = aiBrief.trim() || pickText(name, lang);
    if (!seed) {
      onError(
        lang === 'ar'
          ? 'اكتبي وصفاً مختصراً للمنتج أولاً ليقوم الذكاء الاصطناعي بصياغته باللغات الثلاث.'
          : 'Enter a brief product idea first for AI drafting.'
      );
      return;
    }
    setAiBusy(true);
    onError('');
    try {
      const res = await generateAdminCopy({
        mode: 'product',
        prompt: seed,
        sourceLang: lang,
      });
      const g = res.generated as {
        name?: LocalizedText;
        description?: LocalizedText;
        features?: LocalizedList;
        howToUse?: LocalizedText;
      };
      if (g.name) setName(g.name);
      if (g.description) setDescription(g.description);
      if (g.features) {
        setFeaturesText({
          ar: (g.features.ar || []).join('\n'),
          tr: (g.features.tr || []).join('\n'),
          en: (g.features.en || []).join('\n'),
        });
      }
      if (g.howToUse) setHowToUse(g.howToUse);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'AI generation failed');
    } finally {
      setAiBusy(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    onError('');
    const numPrice = Math.max(0, Number(price) || 0);
    const numOriginal = originalPrice.trim() ? Number(originalPrice) : null;
    const discountPercent =
      numOriginal && numOriginal > numPrice
        ? Math.round(((numOriginal - numPrice) / numOriginal) * 100)
        : 0;

    const payload: Omit<Product, 'id' | 'createdAt'> = {
      categoryId,
      images,
      name,
      description,
      features: {
        ar: featuresText.ar.split('\n').map((s) => s.trim()).filter(Boolean),
        tr: featuresText.tr.split('\n').map((s) => s.trim()).filter(Boolean),
        en: featuresText.en.split('\n').map((s) => s.trim()).filter(Boolean),
      },
      howToUse,
      price: numPrice,
      originalPrice: numOriginal && numOriginal > numPrice ? numOriginal : null,
      discountPercent,
      isBestSeller,
      isLatest,
      inStock,
    };

    setSaving(true);
    try {
      const next = editingId
        ? await updateProduct(editingId, payload)
        : await createProduct(payload);
      resetForm();
      await onSaved(next);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  const numPricePreview = Number(price) || 0;
  const numOrigPreview = Number(originalPrice) || 0;
  const discountPreview =
    numOrigPreview > numPricePreview && numPricePreview >= 0
      ? Math.round(((numOrigPreview - numPricePreview) / numOrigPreview) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F8E6EE]">
          <h2 className="font-display text-xl font-bold text-[#2A1620]">
            {editingId ? t.actions.edit : t.actions.add} · {t.tabs.products}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-[#6E515E] hover:text-[#CC4B7C] cursor-pointer"
            >
              {t.actions.cancel}
            </button>
          )}
        </div>

        {/* AI Copywriting Helper */}
        <div className="p-4 bg-[#FFF7FA] border border-[#F4DAE4] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#9D2F5A] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.actions.aiGenerate}</span>
            </span>
            <AiAssistBadge
              loading={aiBusy}
              label={aiBusy ? t.actions.aiGenerating : t.actions.aiGenerate}
              onClick={handleAiDraft}
            />
          </div>
          <input
            type="text"
            value={aiBrief}
            onChange={(e) => setAiBrief(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'مثال: عطر نسائي بالورد الدمشقي والفانيليا الناعمة يدوم طويلاً، 50 مل...'
                : lang === 'tr'
                ? 'Örnek: Şam gülü ve vanilya notalı kalıcı kadın parfümü 50ml...'
                : 'Example: Long-lasting damask rose and soft vanilla eau de parfum 50ml...'
            }
            className="w-full min-h-[40px] px-3.5 py-2 bg-white border border-[#F4DAE4] rounded-lg text-xs sm:text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C]"
          />
        </div>

        <MultiImageField
          label={lang === 'ar' ? 'صور المنتج' : lang === 'tr' ? 'Ürün Görselleri' : 'Product Images'}
          images={images}
          onChange={setImages}
          lang={lang}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'التصنيف' : lang === 'tr' ? 'Kategori' : 'Category'}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full min-h-[42px] px-3 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620]"
            >
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {pickText(c.name, lang)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'السعر الحالي (₺)' : lang === 'tr' ? 'Satış Fiyatı (₺)' : 'Price (₺ TRY)'} *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              dir="ltr"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar'
                ? 'السعر قبل الخصم (اختياري)'
                : lang === 'tr'
                ? 'İndirim Öncesi Fiyat'
                : 'Original Price (Optional)'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                dir="ltr"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] tabular-nums"
              />
              {discountPreview > 0 && (
                <span className="text-xs font-semibold text-[#CC4B7C] whitespace-nowrap tabular-nums">
                  -{discountPreview}%
                </span>
              )}
            </div>
          </div>
        </div>

        <LocalizedInput
          label={lang === 'ar' ? 'اسم المنتج' : lang === 'tr' ? 'Ürün Adı' : 'Product Name'}
          value={name}
          onChange={setName}
        />

        <LocalizedInput
          label={lang === 'ar' ? 'وصف المنتج' : lang === 'tr' ? 'Ürün Açıklaması' : 'Description'}
          value={description}
          onChange={setDescription}
          multiline
          rows={3}
        />

        <LocalizedInput
          label={
            lang === 'ar'
              ? 'المميزات (كل ميزة في سطر)'
              : lang === 'tr'
              ? 'Özellikler (Her satıra bir madde)'
              : 'Highlights / Features (One per line)'
          }
          value={featuresText}
          onChange={setFeaturesText}
          multiline
          rows={3}
        />

        <LocalizedInput
          label={
            lang === 'ar'
              ? 'طريقة الاستخدام (اختياري)'
              : lang === 'tr'
              ? 'Kullanım Şekli (Opsiyonel)'
              : 'How to Use (Optional)'
          }
          value={howToUse}
          onChange={setHowToUse}
          multiline
          rows={2}
        />

        <div className="flex flex-wrap items-center gap-6 pt-1">
          <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#2A1620] cursor-pointer">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="accent-[#CC4B7C] w-4 h-4"
            />
            <span>{lang === 'ar' ? 'الأكثر مبيعاً' : lang === 'tr' ? 'Çok Satan' : 'Best Seller'}</span>
          </label>
          <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#2A1620] cursor-pointer">
            <input
              type="checkbox"
              checked={isLatest}
              onChange={(e) => setIsLatest(e.target.checked)}
              className="accent-[#CC4B7C] w-4 h-4"
            />
            <span>{lang === 'ar' ? 'أحدث المنتجات' : lang === 'tr' ? 'Yeni Ürün' : 'Latest Arrival'}</span>
          </label>
          <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#2A1620] cursor-pointer">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="accent-[#CC4B7C] w-4 h-4"
            />
            <span>{lang === 'ar' ? 'متوفر بالمخزون' : lang === 'tr' ? 'Stokta Var' : 'In Stock'}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] px-6 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] disabled:opacity-60 text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          {saving ? t.actions.saving : editingId ? t.actions.save : t.actions.add}
        </button>
      </form>

      {/* Product List */}
      <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-[#2A1620]">
          {t.tabs.products} ({data.products.length})
        </h3>

        {data.products.length === 0 ? (
          <p className="text-sm text-[#6E515E]">
            {lang === 'ar'
              ? 'لا توجد منتجات مضافة بعد. أضيفي أول منتج من النموذج أعلاه.'
              : lang === 'tr'
              ? 'Henüz ürün eklenmedi. Yukarıdaki formdan ilk ürününüzü ekleyin.'
              : 'No products added yet. Create your first product above.'}
          </p>
        ) : (
          <div className="divide-y divide-[#F8E6EE]">
            {data.products.map((p) => {
              const cat = data.categories.find((c) => c.id === p.categoryId);
              return (
                <div
                  key={p.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#F4DAE4] bg-[#FFF7FA] shrink-0">
                      <SafeImage
                        src={p.images[0]}
                        alt={pickText(p.name, lang)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="font-semibold text-sm text-[#2A1620] truncate">
                        {pickText(p.name, lang)}
                      </div>
                      <div className="text-xs text-[#6E515E] flex items-center gap-2 flex-wrap tabular-nums">
                        <span className="font-bold text-[#CC4B7C]">{formatTRY(p.price, lang)}</span>
                        {p.originalPrice && (
                          <span className="line-through">{formatTRY(p.originalPrice, lang)}</span>
                        )}
                        {cat && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{pickText(cat.name, lang)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="min-h-[34px] px-3 py-1 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-medium rounded-md inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#CC4B7C]" />
                      <span>{t.actions.edit}</span>
                    </button>
                    <ConfirmDeleteButton
                      lang={lang}
                      onConfirm={async () => {
                        const next = await deleteProduct(p.id);
                        await onSaved(next);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- 2. CATEGORIES MANAGER ---------------- */
function CategoriesManager({
  data,
  lang,
  onSaved,
  onError,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<LocalizedText>(emptyText());
  const [sortOrder, setSortOrder] = useState('1');
  const [saving, setSaving] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    onError('');
    setSaving(true);
    try {
      const payload = {
        name,
        sortOrder: Number(sortOrder) || 1,
      };
      const next = editingId
        ? await updateCategory(editingId, payload)
        : await createCategory(payload);
      setEditingId(null);
      setName(emptyText());
      setSortOrder(String(next.categories.length + 1));
      await onSaved(next);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Category save failed');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setSortOrder(String(c.sortOrder));
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F8E6EE]">
          <h2 className="font-display text-xl font-bold text-[#2A1620]">
            {editingId ? t.actions.edit : t.actions.add} · {t.tabs.categories}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName(emptyText());
              }}
              className="text-xs text-[#6E515E] hover:text-[#CC4B7C] cursor-pointer"
            >
              {t.actions.cancel}
            </button>
          )}
        </div>

        <LocalizedInput
          label={lang === 'ar' ? 'اسم التصنيف' : lang === 'tr' ? 'Kategori Adı' : 'Category Name'}
          value={name}
          onChange={setName}
        />

        <div className="max-w-[180px]">
          <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
            {lang === 'ar' ? 'الترتيب' : lang === 'tr' ? 'Sıralama' : 'Sort Order'}
          </label>
          <input
            type="number"
            min="1"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full min-h-[40px] px-3 py-1.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm tabular-nums"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="min-h-[42px] px-5 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          {saving ? t.actions.saving : editingId ? t.actions.save : t.actions.add}
        </button>
      </form>

      <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 divide-y divide-[#F8E6EE]">
        {data.categories.map((cat) => (
          <div key={cat.id} className="py-3.5 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-[#2A1620]">{pickText(cat.name, lang)}</div>
              <div className="text-xs text-[#6E515E]">
                {cat.name.ar} · {cat.name.tr} · {cat.name.en}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startEdit(cat)}
                className="min-h-[34px] px-3 py-1 bg-[#FFF7FA] border border-[#F4DAE4] rounded-md text-xs font-medium cursor-pointer"
              >
                {t.actions.edit}
              </button>
              <ConfirmDeleteButton
                lang={lang}
                onConfirm={async () => {
                  const next = await deleteCategory(cat.id);
                  await onSaved(next);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- 3. OFFERS MANAGER ---------------- */
function OffersManager({
  data,
  lang,
  onSaved,
  onError,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState<LocalizedText>(emptyText());
  const [description, setDescription] = useState<LocalizedText>(emptyText());
  const [discountLabel, setDiscountLabel] = useState<LocalizedText>(emptyText());
  const [image, setImage] = useState('');
  const [linkedCategoryId, setLinkedCategoryId] = useState('');
  const [linkedProductId, setLinkedProductId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiBrief, setAiBrief] = useState('');

  function resetForm() {
    setEditingId(null);
    setTitle(emptyText());
    setDescription(emptyText());
    setDiscountLabel(emptyText());
    setImage('');
    setLinkedCategoryId('');
    setLinkedProductId('');
    setIsActive(true);
    setAiBrief('');
  }

  function startEdit(o: Offer) {
    setEditingId(o.id);
    setTitle(o.title);
    setDescription(o.description);
    setDiscountLabel(o.discountLabel);
    setImage(o.image);
    setLinkedCategoryId(o.linkedCategoryId);
    setLinkedProductId(o.linkedProductId);
    setIsActive(o.isActive);
  }

  async function handleAiDraft() {
    const seed = aiBrief.trim() || pickText(title, lang);
    if (!seed) return;
    setAiBusy(true);
    onError('');
    try {
      const res = await generateAdminCopy({ mode: 'offer', prompt: seed, sourceLang: lang });
      const g = res.generated as {
        title?: LocalizedText;
        description?: LocalizedText;
        discountLabel?: LocalizedText;
      };
      if (g.title) setTitle(g.title);
      if (g.description) setDescription(g.description);
      if (g.discountLabel) setDiscountLabel(g.discountLabel);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'AI generation failed');
    } finally {
      setAiBusy(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    onError('');
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        discountLabel,
        image,
        linkedCategoryId,
        linkedProductId,
        isActive,
      };
      const next = editingId
        ? await updateOffer(editingId, payload)
        : await createOffer(payload);
      resetForm();
      await onSaved(next);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Offer save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F8E6EE]">
          <h2 className="font-display text-xl font-bold text-[#2A1620]">
            {editingId ? t.actions.edit : t.actions.add} · {t.tabs.offers}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#6E515E] hover:text-[#CC4B7C] cursor-pointer"
            >
              {t.actions.cancel}
            </button>
          )}
        </div>

        <div className="p-4 bg-[#FFF7FA] border border-[#F4DAE4] rounded-xl space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[#9D2F5A]">{t.actions.aiGenerate}</span>
            <AiAssistBadge
              loading={aiBusy}
              label={aiBusy ? t.actions.aiGenerating : t.actions.aiGenerate}
              onClick={handleAiDraft}
            />
          </div>
          <input
            type="text"
            value={aiBrief}
            onChange={(e) => setAiBrief(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'فكرة العرض... مثال: خصم 25% على باقة العطور الوردية لفترة محدودة'
                : 'Offer brief... e.g. 25% off floral gift sets'
            }
            className="w-full min-h-[38px] px-3 py-1.5 bg-white border border-[#F4DAE4] rounded-lg text-xs"
          />
        </div>

        <SingleImageField
          label={lang === 'ar' ? 'صورة العرض' : lang === 'tr' ? 'Kampanya Görseli' : 'Offer Image'}
          value={image}
          onChange={setImage}
          lang={lang}
        />

        <LocalizedInput
          label={lang === 'ar' ? 'عنوان العرض' : lang === 'tr' ? 'Kampanya Başlığı' : 'Offer Title'}
          value={title}
          onChange={setTitle}
        />
        <LocalizedInput
          label={lang === 'ar' ? 'شارة الخصم (مثال: خصم 20%)' : lang === 'tr' ? 'İndirim Etiketi' : 'Discount Label'}
          value={discountLabel}
          onChange={setDiscountLabel}
        />
        <LocalizedInput
          label={lang === 'ar' ? 'تفاصيل العرض' : lang === 'tr' ? 'Kampanya Açıklaması' : 'Description'}
          value={description}
          onChange={setDescription}
          multiline
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'ربط بتصنيف (اختياري)' : 'Link Category (Optional)'}
            </label>
            <select
              value={linkedCategoryId}
              onChange={(e) => setLinkedCategoryId(e.target.value)}
              className="w-full min-h-[40px] px-3 py-1.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
            >
              <option value="">—</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {pickText(c.name, lang)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'ربط بمنتج (اختياري)' : 'Link Product (Optional)'}
            </label>
            <select
              value={linkedProductId}
              onChange={(e) => setLinkedProductId(e.target.value)}
              className="w-full min-h-[40px] px-3 py-1.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
            >
              <option value="">—</option>
              {data.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {pickText(p.name, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[#2A1620] cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-[#CC4B7C] w-4 h-4"
          />
          <span>{lang === 'ar' ? 'عرض نشط على الموقع' : lang === 'tr' ? 'Sitede Aktif' : 'Active on Storefront'}</span>
        </label>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[42px] px-5 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            {saving ? t.actions.saving : editingId ? t.actions.save : t.actions.add}
          </button>
        </div>
      </form>

      <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 divide-y divide-[#F8E6EE]">
        {data.offers.length === 0 ? (
          <p className="text-sm text-[#6E515E]">
            {lang === 'ar' ? 'لا توجد عروض مضافة حالياً.' : 'No offers added yet.'}
          </p>
        ) : (
          data.offers.map((o) => (
            <div key={o.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-[#2A1620]">{pickText(o.title, lang)}</div>
                <div className="text-xs text-[#9D2F5A]">{pickText(o.discountLabel, lang)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(o)}
                  className="min-h-[34px] px-3 py-1 bg-[#FFF7FA] border border-[#F4DAE4] rounded-md text-xs font-medium cursor-pointer"
                >
                  {t.actions.edit}
                </button>
                <ConfirmDeleteButton
                  lang={lang}
                  onConfirm={async () => {
                    const next = await deleteOffer(o.id);
                    await onSaved(next);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------- 4. REVIEWS MANAGER ---------------- */
function ReviewsManager({
  data,
  lang,
  onSaved,
  onError,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditingId(null);
    setCustomerName('');
    setRating(5);
    setComment('');
    setIsVisible(true);
  }

  function startEdit(r: Review) {
    setEditingId(r.id);
    setCustomerName(r.customerName);
    setRating(r.rating);
    setComment(r.comment);
    setIsVisible(r.isVisible);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    onError('');
    setSaving(true);
    try {
      const payload = { customerName, rating, comment, isVisible };
      const next = editingId
        ? await updateReview(editingId, payload)
        : await createReview(payload);
      resetForm();
      await onSaved(next);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Review save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F8E6EE]">
          <h2 className="font-display text-xl font-bold text-[#2A1620]">
            {editingId ? t.actions.edit : t.actions.add} · {t.tabs.reviews}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-[#6E515E] hover:text-[#CC4B7C] cursor-pointer"
            >
              {t.actions.cancel}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'اسم العميلة' : lang === 'tr' ? 'Müşteri Adı' : 'Customer Name'} *
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'التقييم بالنجوم' : lang === 'tr' ? 'Puan' : 'Star Rating'}
            </label>
            <div className="flex items-center gap-1.5 min-h-[42px]">
              {[1, 2, 3, 4, 5].map((starVal) => (
                <button
                  key={starVal}
                  type="button"
                  onClick={() => setRating(starVal)}
                  className="p-1.5 rounded-md hover:bg-[#FFF7FA] cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      starVal <= rating ? 'fill-[#CC4B7C] text-[#CC4B7C]' : 'text-[#F3D6E2]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
            {lang === 'ar' ? 'رأي العميلة' : lang === 'tr' ? 'Yorum' : 'Review Comment'} *
          </label>
          <textarea
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-[#2A1620] cursor-pointer">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="accent-[#CC4B7C] w-4 h-4"
          />
          <span>{lang === 'ar' ? 'إظهار في الموقع' : lang === 'tr' ? 'Sitede Göster' : 'Visible on Storefront'}</span>
        </label>

        <div>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[42px] px-5 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-semibold rounded-lg cursor-pointer"
          >
            {saving ? t.actions.saving : editingId ? t.actions.save : t.actions.add}
          </button>
        </div>
      </form>

      <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 divide-y divide-[#F8E6EE]">
        {data.reviews.length === 0 ? (
          <p className="text-sm text-[#6E515E]">
            {lang === 'ar' ? 'لا توجد آراء مضافة بعد.' : 'No reviews added yet.'}
          </p>
        ) : (
          data.reviews.map((rev) => (
            <div key={rev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#2A1620]">{rev.customerName}</span>
                  <span className="text-xs text-[#CC4B7C] tabular-nums">{'★'.repeat(rev.rating)}</span>
                </div>
                <p className="text-sm text-[#6E515E]">{rev.comment}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(rev)}
                  className="min-h-[34px] px-3 py-1 bg-[#FFF7FA] border border-[#F4DAE4] rounded-md text-xs font-medium cursor-pointer"
                >
                  {t.actions.edit}
                </button>
                <ConfirmDeleteButton
                  lang={lang}
                  onConfirm={async () => {
                    const next = await deleteReview(rev.id);
                    await onSaved(next);
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------- 5. SITE TEXTS & BANNERS MANAGER ---------------- */
function SiteTextsAndBannersManager({
  data,
  lang,
  onSaved,
  onError,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const [form, setForm] = useState<SiteSettings>(data.settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(data.settings);
  }, [data.settings]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    onError('');
    setSaving(true);
    try {
      const next = await updateSettings(form);
      await onSaved(next);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Settings save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-6">
        <h2 className="font-display text-xl font-bold text-[#2A1620] pb-3 border-b border-[#F8E6EE]">
          {lang === 'ar' ? 'صور الواجهة والبنرات' : lang === 'tr' ? 'Hero ve Banner Görselleri' : 'Hero & Banner Images'}
        </h2>

        <MultiImageField
          label={lang === 'ar' ? 'صور الـ Hero الرئيسية' : 'Hero Images'}
          images={form.heroImages}
          onChange={(heroImages) => setForm({ ...form, heroImages })}
          lang={lang}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <SingleImageField
            label={lang === 'ar' ? 'بنر العروض الخاصة' : 'Offers Banner Image'}
            value={form.promoBannerImage}
            onChange={(promoBannerImage) => setForm({ ...form, promoBannerImage })}
            lang={lang}
          />
          <SingleImageField
            label={lang === 'ar' ? 'صورة قسم لماذا نحن' : 'Why Us Image'}
            value={form.whyUsImage}
            onChange={(whyUsImage) => setForm({ ...form, whyUsImage })}
            lang={lang}
          />
          <SingleImageField
            label={lang === 'ar' ? 'صورة قسم TikTok' : 'TikTok Showcase Image'}
            value={form.tiktokImage}
            onChange={(tiktokImage) => setForm({ ...form, tiktokImage })}
            lang={lang}
          />
        </div>
      </div>

      <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-5">
        <h2 className="font-display text-xl font-bold text-[#2A1620] pb-3 border-b border-[#F8E6EE]">
          {lang === 'ar' ? 'نصوص الـ Hero والأقسام' : 'Hero & Section Texts'}
        </h2>

        <LocalizedInput
          label={lang === 'ar' ? 'العنوان الفرعي العلوي (Hero)' : 'Hero Eyebrow'}
          value={form.heroEyebrow}
          onChange={(heroEyebrow) => setForm({ ...form, heroEyebrow })}
        />
        <LocalizedInput
          label={lang === 'ar' ? 'عنوان الـ Hero الرئيسي' : 'Hero Title'}
          value={form.heroTitle}
          onChange={(heroTitle) => setForm({ ...form, heroTitle })}
        />
        <LocalizedInput
          label={lang === 'ar' ? 'النص التسويقي في الـ Hero' : 'Hero Marketing Text'}
          value={form.heroSubtitle}
          onChange={(heroSubtitle) => setForm({ ...form, heroSubtitle })}
          multiline
          rows={3}
        />
        <LocalizedInput
          label={lang === 'ar' ? 'نص زر الـ Hero' : 'Hero CTA Button'}
          value={form.heroCta}
          onChange={(heroCta) => setForm({ ...form, heroCta })}
        />

        <div className="pt-4 border-t border-[#F8E6EE] grid grid-cols-1 md:grid-cols-2 gap-5">
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان الأكثر مبيعاً' : 'Best Sellers Title'}
            value={form.bestSellersTitle}
            onChange={(bestSellersTitle) => setForm({ ...form, bestSellersTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان أحدث المنتجات' : 'Latest Products Title'}
            value={form.latestTitle}
            onChange={(latestTitle) => setForm({ ...form, latestTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان العروض الخاصة' : 'Special Offers Title'}
            value={form.offersTitle}
            onChange={(offersTitle) => setForm({ ...form, offersTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان لماذا ELHAM BEAUTY' : 'Why ELHAM BEAUTY Title'}
            value={form.whyTitle}
            onChange={(whyTitle) => setForm({ ...form, whyTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان آراء العملاء' : 'Reviews Title'}
            value={form.reviewsTitle}
            onChange={(reviewsTitle) => setForm({ ...form, reviewsTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان قسم TikTok' : 'TikTok Section Title'}
            value={form.tiktokTitle}
            onChange={(tiktokTitle) => setForm({ ...form, tiktokTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان النشرة البريدية' : 'Newsletter Heading'}
            value={form.newsletterTitle}
            onChange={(newsletterTitle) => setForm({ ...form, newsletterTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'وصف النشرة البريدية' : 'Newsletter Subtitle'}
            value={form.newsletterSubtitle}
            onChange={(newsletterSubtitle) => setForm({ ...form, newsletterSubtitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'عنوان قسم انضم للفريق' : 'Join Team Title'}
            value={form.joinTeamTitle}
            onChange={(joinTeamTitle) => setForm({ ...form, joinTeamTitle })}
          />
          <LocalizedInput
            label={lang === 'ar' ? 'زر استمارة الانضمام للفريق' : 'Join Team Button Text'}
            value={form.joinTeamCta}
            onChange={(joinTeamCta) => setForm({ ...form, joinTeamCta })}
          />
        </div>

        <LocalizedInput
          label={lang === 'ar' ? 'وصف قسم انضم للفريق' : 'Join Team Subtitle'}
          value={form.joinTeamSubtitle}
          onChange={(joinTeamSubtitle) => setForm({ ...form, joinTeamSubtitle })}
          multiline
          rows={2}
        />

        <LocalizedInput
          label={lang === 'ar' ? 'نص الفوتر التعريفي' : 'Footer Tagline'}
          value={form.footerTagline}
          onChange={(footerTagline) => setForm({ ...form, footerTagline })}
        />

        <div className="pt-4 border-t border-[#F8E6EE] space-y-4">
          <h3 className="text-sm font-semibold text-[#2A1620]">
            {lang === 'ar' ? 'مميزات العلامة (لماذا تختارين ELHAM BEAUTY؟)' : 'Why Us Pillars'}
          </h3>
          {form.whyPillars.map((pillar, idx) => (
            <div key={pillar.id} className="p-4 bg-[#FFF7FA] border border-[#F4DAE4] rounded-xl space-y-3">
              <div className="text-xs font-semibold text-[#CC4B7C] tabular-nums">0{idx + 1}.</div>
              <LocalizedInput
                label={lang === 'ar' ? 'العنوان' : 'Title'}
                value={pillar.title}
                onChange={(nextTitle) => {
                  const copy = [...form.whyPillars];
                  copy[idx] = { ...pillar, title: nextTitle };
                  setForm({ ...form, whyPillars: copy });
                }}
              />
              <LocalizedInput
                label={lang === 'ar' ? 'الوصف' : 'Description'}
                value={pillar.description}
                onChange={(nextDesc) => {
                  const copy = [...form.whyPillars];
                  copy[idx] = { ...pillar, description: nextDesc };
                  setForm({ ...form, whyPillars: copy });
                }}
                multiline
                rows={2}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="min-h-[46px] px-7 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          {saving ? t.actions.saving : t.actions.save}
        </button>
      </div>
    </form>
  );
}

/* ---------------- 6. CONTACT, SOCIAL & PASSWORD SETTINGS ---------------- */
function ContactAndSecurityManager({
  data,
  lang,
  onSaved,
  onTokenRefresh,
  onError,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onTokenRefresh: (token: string) => void;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const [brandName, setBrandName] = useState(data.settings.brandName);
  const [phone, setPhone] = useState(data.settings.phone);
  const [tiktokUrl, setTiktokUrl] = useState(data.settings.tiktokUrl);
  const [instagramUrl, setInstagramUrl] = useState(data.settings.instagramUrl);
  const [facebookUrl, setFacebookUrl] = useState(data.settings.facebookUrl);
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    onError('');
    setSaving(true);
    try {
      const next = await updateSettings({
        brandName,
        phone,
        tiktokUrl,
        instagramUrl,
        facebookUrl,
      });
      await onSaved(next);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Settings update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    onError('');
    setPwSuccess('');
    setPwBusy(true);
    try {
      const res = await changeAdminPassword(newPassword.trim());
      onTokenRefresh(res.token);
      setNewPassword('');
      setPwSuccess(t.actions.savedToast);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Password update failed');
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSaveSettings}
        className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-4"
      >
        <h2 className="font-display text-xl font-bold text-[#2A1620] pb-3 border-b border-[#F8E6EE]">
          {t.tabs.settings}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'اسم البراند' : 'Brand Name'}
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
            </label>
            <input
              type="text"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              TikTok URL
            </label>
            <input
              type="url"
              dir="ltr"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'Instagram URL (اتركيه فارغاً للإخفاء)' : 'Instagram URL (leave blank to hide)'}
            </label>
            <input
              type="url"
              dir="ltr"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
              {lang === 'ar' ? 'Facebook URL (اتركيه فارغاً للإخفاء)' : 'Facebook URL (leave blank to hide)'}
            </label>
            <input
              type="url"
              dir="ltr"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="min-h-[44px] px-6 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-semibold rounded-lg cursor-pointer"
        >
          {saving ? t.actions.saving : t.actions.save}
        </button>
      </form>

      <form
        onSubmit={handleChangePassword}
        className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-4"
      >
        <h3 className="font-display text-lg font-bold text-[#2A1620]">
          {lang === 'ar' ? 'تغيير كلمة مرور لوحة التحكم' : lang === 'tr' ? 'Yönetici Şifresini Değiştir' : 'Update Admin Password'}
        </h3>
        <div className="max-w-sm space-y-3">
          <input
            type="password"
            minLength={6}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={lang === 'ar' ? 'كلمة مرور جديدة (6 أحرف على الأقل)' : 'New password (min 6 chars)'}
            className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
          />
          {pwSuccess && <p className="text-xs text-[#CC4B7C] font-medium">{pwSuccess}</p>}
          <button
            type="submit"
            disabled={pwBusy}
            className="min-h-[40px] px-5 py-2 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-semibold rounded-lg cursor-pointer"
          >
            {pwBusy ? t.actions.saving : t.actions.save}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- 7. ORDERS INBOX ---------------- */
function OrdersManager({
  data,
  lang,
  onSaved,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const statuses: OrderStatus[] = ['new', 'processing', 'shipped', 'completed', 'cancelled'];

  return (
    <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-4">
      <h2 className="font-display text-xl font-bold text-[#2A1620]">
        {t.tabs.orders} ({data.orders.length})
      </h2>

      {data.orders.length === 0 ? (
        <p className="text-sm text-[#6E515E]">
          {lang === 'ar'
            ? 'لا توجد طلبات واردة حتى الآن.'
            : lang === 'tr'
            ? 'Henüz gelen sipariş yok.'
            : 'No customer orders received yet.'}
        </p>
      ) : (
        <div className="space-y-4">
          {data.orders.map((ord) => {
            const clientWa = cleanPhoneForWhatsApp(ord.phone);
            return (
              <div
                key={ord.id}
                className="p-5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-xl space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-[#9D2F5A] tabular-nums">
                      {ord.orderNumber} · {new Date(ord.createdAt).toLocaleString()}
                    </div>
                    <div className="text-base font-bold text-[#2A1620]">
                      {ord.fullName} — <span dir="ltr">{ord.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={ord.status}
                      onChange={async (e) => {
                        const next = await updateOrderStatus(ord.id, e.target.value as OrderStatus);
                        await onSaved(next);
                      }}
                      className="min-h-[36px] px-3 py-1 bg-white border border-[#F4DAE4] rounded-lg text-xs font-medium text-[#2A1620]"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {getStatusLabel(s, lang)}
                        </option>
                      ))}
                    </select>

                    <ConfirmDeleteButton
                      lang={lang}
                      onConfirm={async () => {
                        const next = await deleteOrder(ord.id);
                        await onSaved(next);
                      }}
                    />
                  </div>
                </div>

                <div className="text-sm text-[#2A1620] flex flex-wrap items-center gap-3 tabular-nums">
                  <span className="font-semibold">{ord.productName}</span>
                  <span>× {ord.quantity}</span>
                  {ord.totalPrice > 0 && (
                    <span className="font-bold text-[#CC4B7C]">{formatTRY(ord.totalPrice, lang)}</span>
                  )}
                </div>

                <div className="text-xs text-[#6E515E] leading-relaxed">
                  {ord.country} · {ord.governorate} · {ord.city} · {ord.district} —{' '}
                  {ord.detailedAddress}
                  {ord.notes ? ` (${ord.notes})` : ''}
                </div>

                {clientWa && (
                  <div>
                    <a
                      href={`https://wa.me/${clientWa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#CC4B7C] hover:underline"
                    >
                      WhatsApp: {ord.phone}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- 8. NEWSLETTER SUBSCRIBERS MANAGER ---------------- */
function SubscribersManager({
  data,
  lang,
  onSaved,
  onToast,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
  onToast: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const [search, setSearch] = useState('');

  const filtered = data.subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.trim().toLowerCase())
  );

  async function copyAllEmails() {
    const text = filtered.map((s) => s.email).join(', ');
    if (!text) return;
    await navigator.clipboard.writeText(text);
    onToast(t.actions.copied);
  }

  function downloadCsv() {
    const rows = [
      'email,language,subscribedAt',
      ...filtered.map((s) => `${s.email},${s.language},${s.subscribedAt}`),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elham-beauty-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-[#2A1620]">
          {t.tabs.subscribers} ({data.subscribers.length})
        </h2>

        {data.subscribers.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyAllEmails}
              className="min-h-[38px] px-3.5 py-1.5 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] rounded-lg text-xs font-medium text-[#2A1620] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#CC4B7C]" />
              <span>{t.actions.copyEmails}</span>
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              className="min-h-[38px] px-3.5 py-1.5 bg-[#CC4B7C] hover:bg-[#B43A69] rounded-lg text-xs font-medium text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.actions.exportCsv}</span>
            </button>
          </div>
        )}
      </div>

      {data.subscribers.length > 0 && (
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email..."
          className="w-full sm:max-w-xs min-h-[40px] px-3.5 py-1.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm"
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-[#6E515E]">
          {lang === 'ar'
            ? 'لا يوجد مشتركون في النشرة البريدية حتى الآن.'
            : lang === 'tr'
            ? 'Henüz bülten abonesi yok.'
            : 'No newsletter subscribers yet.'}
        </p>
      ) : (
        <div className="divide-y divide-[#F8E6EE]">
          {filtered.map((sub) => (
            <div className="py-3 flex items-center justify-between gap-4" key={sub.id}>
              <div className="min-w-0">
                <div className="text-sm font-medium text-[#2A1620] truncate" dir="ltr">
                  {sub.email}
                </div>
                <div className="text-xs text-[#6E515E] tabular-nums">
                  {sub.language.toUpperCase()} · {new Date(sub.subscribedAt).toLocaleDateString()}
                </div>
              </div>
              <ConfirmDeleteButton
                lang={lang}
                onConfirm={async () => {
                  const next = await deleteSubscriber(sub.id);
                  await onSaved(next);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- 9. TEAM APPLICATIONS MANAGER ---------------- */
function TeamApplicationsManager({
  data,
  lang,
  onSaved,
}: {
  data: AdminDashboardData;
  lang: Language;
  onSaved: (next: AdminDashboardData) => Promise<void>;
  onError: (msg: string) => void;
}) {
  const t = UI_STRINGS[lang].admin;
  const statuses: TeamApplicationStatus[] = ['new', 'reviewed', 'accepted', 'archived'];

  return (
    <div className="bg-white border border-[#F4DAE4] rounded-2xl p-6 space-y-4">
      <h2 className="font-display text-xl font-bold text-[#2A1620]">
        {t.tabs.teamApplications} ({data.teamApplications.length})
      </h2>

      {data.teamApplications.length === 0 ? (
        <p className="text-sm text-[#6E515E]">
          {lang === 'ar'
            ? 'لا توجد طلبات انضمام واردة بعد.'
            : lang === 'tr'
            ? 'Henüz ekip başvurusu bulunmuyor.'
            : 'No team applications received yet.'}
        </p>
      ) : (
        <div className="space-y-4">
          {data.teamApplications.map((appItem) => {
            const waDigits = cleanPhoneForWhatsApp(appItem.phone);
            return (
              <div
                key={appItem.id}
                className="p-5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-xl space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-[#9D2F5A] tabular-nums">
                      {appItem.applicationNumber} · {new Date(appItem.createdAt).toLocaleString()}
                    </div>
                    <div className="text-base font-bold text-[#2A1620]">
                      {appItem.fullName} — <span dir="ltr">{appItem.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={appItem.status}
                      onChange={async (e) => {
                        const next = await updateTeamApplicationStatus(
                          appItem.id,
                          e.target.value as TeamApplicationStatus
                        );
                        await onSaved(next);
                      }}
                      className="min-h-[36px] px-3 py-1 bg-white border border-[#F4DAE4] rounded-lg text-xs font-medium text-[#2A1620]"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {getTeamStatusLabel(s, lang)}
                        </option>
                      ))}
                    </select>
                    <ConfirmDeleteButton
                      lang={lang}
                      onConfirm={async () => {
                        const next = await deleteTeamApplication(appItem.id);
                        await onSaved(next);
                      }}
                    />
                  </div>
                </div>

                <div className="text-sm text-[#2A1620] font-medium">
                  {appItem.country} · {appItem.city}
                  {appItem.interestArea ? ` — ${appItem.interestArea}` : ''}
                </div>

                {appItem.notes && (
                  <p className="text-xs text-[#6E515E] leading-relaxed">{appItem.notes}</p>
                )}

                {waDigits && (
                  <div>
                    <a
                      href={`https://wa.me/${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#CC4B7C] hover:underline"
                    >
                      WhatsApp: {appItem.phone}
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
