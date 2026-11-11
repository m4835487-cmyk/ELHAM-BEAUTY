import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import type { Category, Language, Offer, Product, Review, SiteSettings } from '../types.ts';
import { UI_STRINGS, cleanPhoneForWhatsApp, pickText } from '../lib/i18n.ts';
import { SafeImage } from './SafeImage.tsx';
import { ProductCard } from './ProductCard.tsx';
import { JoinTeamSection } from './JoinTeamSection.tsx';

interface HomeViewProps {
  settings: SiteSettings;
  categories: Category[];
  products: Product[];
  offers: Offer[];
  reviews: Review[];
  lang: Language;
  onNavigateProducts: (categoryId?: string) => void;
  onSelectProduct: (productId: string) => void;
  onOpenAdvisor: () => void;
  onNavigateAdmin: () => void;
}

export function HomeView({
  settings,
  categories,
  products,
  offers,
  reviews,
  lang,
  onNavigateProducts,
  onSelectProduct,
  onOpenAdvisor,
  onNavigateAdmin,
}: HomeViewProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const t = UI_STRINGS[lang];
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const heroImages =
    settings.heroImages.length > 0
      ? settings.heroImages
      : ['/src/assets/images/hero_elham_luxury_1794422796549.jpg'];
  const currentHero = heroImages[heroIndex % heroImages.length];

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 6);
  const latestProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const waDigits = cleanPhoneForWhatsApp(settings.phone);

  return (
    <div>
      {/* 1. LUXURY HERO SECTION */}
      <section id="hero" className="bg-white border-b border-[#F8E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Editorial Copy Column */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col justify-center space-y-6 py-2"
            >
              <div className="text-xs sm:text-sm font-medium tracking-wider text-[#9D2F5A]">
                {pickText(settings.heroEyebrow, lang)}
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[0.04em] text-[#2A1620] leading-[1.08] text-balance">
                {pickText(settings.heroTitle, lang) || 'ELHAM BEAUTY'}
              </h1>

              <p className="text-base sm:text-lg text-[#6E515E] leading-relaxed max-w-xl">
                {pickText(settings.heroSubtitle, lang)}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigateProducts()}
                  className="min-h-[48px] px-7 py-3 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm sm:text-base font-semibold rounded-lg inline-flex items-center gap-2.5 transition-colors duration-200 cursor-pointer"
                >
                  <span>{pickText(settings.heroCta, lang)}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onOpenAdvisor}
                  className="min-h-[48px] px-5 py-3 bg-[#FFF7FA] hover:bg-[#FCE8F0] text-[#2A1620] border border-[#F4DAE4] text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors duration-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#CC4B7C]" />
                  <span>{t.home.openAdvisor}</span>
                </button>

                <a
                  href="#join-team"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('join-team')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="min-h-[48px] px-4 py-3 text-sm font-medium text-[#9D2F5A] hover:text-[#CC4B7C] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Users className="w-4 h-4" />
                  <span>{pickText(settings.joinTeamTitle, lang)}</span>
                </a>
              </div>

              {/* Starter Category Quick Links */}
              {categories.length > 0 && (
                <div className="pt-4 border-t border-[#F8E6EE] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-[#6E515E]">
                  {categories.map((cat, idx) => (
                    <span key={cat.id} className="inline-flex items-center gap-4">
                      {idx > 0 && (
                        <span aria-hidden="true" className="text-[#E6B8CA]">
                          ·
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onNavigateProducts(cat.id)}
                        className="hover:text-[#CC4B7C] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {pickText(cat.name, lang)}
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Hero Photography Column */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#F4DAE4] bg-[#FFF7FA] min-h-[300px] sm:min-h-[420px] lg:min-h-[480px]"
            >
              <SafeImage
                src={currentHero}
                alt="ELHAM BEAUTY Luxury Perfumes and Cosmetics"
                fallbackTitle="ELHAM BEAUTY"
                className="w-full h-full object-cover"
              />
              {heroImages.length > 1 && (
                <div className="absolute bottom-4 end-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#F4DAE4] rounded-lg p-1">
                  <button
                    type="button"
                    aria-label="Previous hero image"
                    onClick={() =>
                      setHeroIndex((i) => (i - 1 + heroImages.length) % heroImages.length)
                    }
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#FCE8F0] text-[#2A1620] cursor-pointer"
                  >
                    {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  <span className="text-xs text-[#6E515E] px-1 tabular-nums">
                    {(heroIndex % heroImages.length) + 1} / {heroImages.length}
                  </span>
                  <button
                    type="button"
                    aria-label="Next hero image"
                    onClick={() => setHeroIndex((i) => (i + 1) % heroImages.length)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#FCE8F0] text-[#2A1620] cursor-pointer"
                  >
                    {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. BEST SELLERS SECTION */}
      <section className="bg-[#FFF7FA] border-b border-[#F8E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
                {pickText(settings.bestSellersTitle, lang)}
              </h2>
              <p className="text-sm sm:text-base text-[#6E515E]">
                {pickText(settings.bestSellersSubtitle, lang)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateProducts()}
              className="text-sm font-medium text-[#CC4B7C] hover:text-[#9D2F5A] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.home.viewAllProducts}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={categoryById.get(product.categoryId)}
                  lang={lang}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#F4DAE4] rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h3 className="text-lg font-semibold text-[#2A1620]">
                  {t.home.bestSellersEmptyTitle}
                </h3>
                <p className="text-sm text-[#6E515E] leading-relaxed">
                  {t.home.bestSellersEmptyDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigateProducts()}
                  className="min-h-[44px] px-5 py-2.5 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {t.home.exploreCatalog}
                </button>
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="min-h-[44px] px-5 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {t.nav.admin}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. LATEST PRODUCTS SECTION */}
      <section className="bg-white border-b border-[#F8E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2 max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
                {pickText(settings.latestTitle, lang)}
              </h2>
              <p className="text-sm sm:text-base text-[#6E515E]">
                {pickText(settings.latestSubtitle, lang)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateProducts()}
              className="text-sm font-medium text-[#CC4B7C] hover:text-[#9D2F5A] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{t.home.viewAllProducts}</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>

          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {latestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={categoryById.get(product.categoryId)}
                  lang={lang}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#FFF7FA] border border-[#F4DAE4] rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-[#2A1620]">
                  {t.home.latestEmptyTitle}
                </h3>
                <p className="text-sm text-[#6E515E] max-w-xl leading-relaxed">
                  {t.home.latestEmptyDesc}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onNavigateProducts(cat.id)}
                    className="min-h-[40px] px-4 py-2 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] rounded-lg text-xs sm:text-sm font-medium text-[#2A1620] transition-colors cursor-pointer"
                  >
                    {pickText(cat.name, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SPECIAL OFFERS SECTION */}
      <section id="offers" className="bg-[#FFF7FA] border-b border-[#F8E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="space-y-2 max-w-2xl mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
              {pickText(settings.offersTitle, lang)}
            </h2>
            <p className="text-sm sm:text-base text-[#6E515E]">
              {pickText(settings.offersSubtitle, lang)}
            </p>
          </div>

          {offers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {offers.map((offer) => (
                <article
                  key={offer.id}
                  className="bg-white border border-[#F4DAE4] rounded-2xl overflow-hidden flex flex-col sm:flex-row items-stretch"
                >
                  <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto bg-[#FFF9FB] shrink-0">
                    <SafeImage
                      src={offer.image || settings.promoBannerImage}
                      alt={pickText(offer.title, lang)}
                      fallbackTitle={pickText(offer.title, lang)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      {pickText(offer.discountLabel, lang) && (
                        <div className="text-xs font-semibold text-[#CC4B7C] tracking-wide">
                          {pickText(offer.discountLabel, lang)}
                        </div>
                      )}
                      <h3 className="font-display text-2xl font-semibold text-[#2A1620]">
                        {pickText(offer.title, lang)}
                      </h3>
                      <p className="text-sm text-[#6E515E] leading-relaxed">
                        {pickText(offer.description, lang)}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          if (offer.linkedProductId) {
                            onSelectProduct(offer.linkedProductId);
                          } else {
                            onNavigateProducts(offer.linkedCategoryId || undefined);
                          }
                        }}
                        className="min-h-[42px] px-5 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>{t.home.browseOffersProducts}</span>
                        <ArrowIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#F4DAE4] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-6 aspect-[16/9] lg:aspect-auto min-h-[240px]">
                <SafeImage
                  src={settings.promoBannerImage}
                  alt={pickText(settings.offersTitle, lang)}
                  fallbackTitle="ELHAM BEAUTY"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center space-y-4">
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#2A1620]">
                  {t.home.offersEmptyTitle}
                </h3>
                <p className="text-sm sm:text-base text-[#6E515E] leading-relaxed">
                  {t.home.offersEmptyDesc}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigateProducts()}
                    className="min-h-[44px] px-6 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>{t.home.browseOffersProducts}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. WHY CHOOSE ELHAM BEAUTY */}
      <section className="bg-white border-b border-[#F8E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-[#F4DAE4] bg-[#FFF7FA] min-h-[300px]">
              <SafeImage
                src={settings.whyUsImage}
                alt={pickText(settings.whyTitle, lang)}
                fallbackTitle="ELHAM BEAUTY"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center space-y-8">
              <div className="space-y-2.5">
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
                  {pickText(settings.whyTitle, lang)}
                </h2>
                <p className="text-sm sm:text-base text-[#6E515E] max-w-2xl">
                  {pickText(settings.whySubtitle, lang)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {settings.whyPillars.map((pillar, idx) => (
                  <div
                    key={pillar.id}
                    className="pt-4 border-t border-[#F4DAE4] space-y-1.5"
                  >
                    <div className="text-xs font-semibold text-[#CC4B7C] tabular-nums">
                      0{idx + 1}.
                    </div>
                    <h3 className="text-base font-semibold text-[#2A1620]">
                      {pickText(pillar.title, lang)}
                    </h3>
                    <p className="text-sm text-[#6E515E] leading-relaxed">
                      {pickText(pillar.description, lang)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CUSTOMER REVIEWS SECTION */}
      <section id="reviews" className="bg-[#FFF7FA] border-b border-[#F8E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="space-y-2 max-w-2xl mb-10">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
              {pickText(settings.reviewsTitle, lang)}
            </h2>
            <p className="text-sm sm:text-base text-[#6E515E]">
              {pickText(settings.reviewsSubtitle, lang)}
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <article
                  key={rev.id}
                  className="bg-white border border-[#F4DAE4] rounded-2xl p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1" aria-label={`${rev.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating
                              ? 'fill-[#CC4B7C] text-[#CC4B7C]'
                              : 'text-[#F3D6E2]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-[#2A1620] leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F8E6EE] text-sm font-semibold text-[#9D2F5A]">
                    {rev.customerName}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#F4DAE4] rounded-2xl p-8 text-center space-y-2">
              <div className="flex justify-center gap-1 text-[#CC4B7C]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FCE8F0] text-[#CC4B7C]" />
                ))}
              </div>
              <h3 className="text-base font-semibold text-[#2A1620]">
                {t.home.reviewsEmptyTitle}
              </h3>
              <p className="text-sm text-[#6E515E] max-w-lg mx-auto">
                {t.home.reviewsEmptyDesc}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 7. TIKTOK SECTION */}
      <section className="bg-white border-b border-[#F8E6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="bg-[#FFF7FA] border border-[#F4DAE4] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center space-y-5">
              <div className="text-xs font-semibold tracking-wider text-[#9D2F5A]">
                {t.home.officialAccount} · TikTok
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
                {pickText(settings.tiktokTitle, lang)}
              </h2>
              <p className="text-sm sm:text-base text-[#6E515E] leading-relaxed max-w-lg">
                {pickText(settings.tiktokSubtitle, lang)}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                {settings.tiktokUrl && (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[46px] px-6 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <span>{t.home.followTikTok}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[46px] px-5 py-2.5 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <span>{t.home.followInstagram}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[46px] px-5 py-2.5 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors"
                  >
                    <span>{t.home.followFacebook}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-6 aspect-[4/3] lg:aspect-auto min-h-[280px]">
              <SafeImage
                src={settings.tiktokImage}
                alt="ELHAM BEAUTY TikTok Showcase"
                fallbackTitle="@hanan_sy_25"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. JOIN TEAM APPLICATION SECTION */}
      <JoinTeamSection settings={settings} lang={lang} />

      {/* 9. CONTACT SECTION */}
      <section id="contact" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-3">
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2A1620] text-balance">
                {pickText(settings.contactTitle, lang)}
              </h2>
              <p className="text-sm sm:text-base text-[#6E515E] leading-relaxed">
                {pickText(settings.contactSubtitle, lang)}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenAdvisor}
                  className="min-h-[44px] px-5 py-2.5 bg-[#FFF7FA] hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#CC4B7C]" />
                  <span>{t.home.openAdvisor}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-[#FFF7FA] border border-[#F4DAE4] rounded-2xl space-y-3">
                <div className="text-xs font-semibold text-[#9D2F5A]">
                  {t.home.callOrWhatsapp}
                </div>
                <div className="text-xl font-bold text-[#2A1620] tabular-nums" dir="ltr">
                  {settings.phone}
                </div>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <a
                    href={`https://wa.me/${waDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[40px] px-4 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t.home.whatsappDirect}</span>
                  </a>
                  <a
                    href={`tel:+${waDigits}`}
                    className="min-h-[40px] px-4 py-2 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#CC4B7C]" />
                    <span>{t.home.directCall}</span>
                  </a>
                </div>
              </div>

              <div className="p-6 bg-[#FFF7FA] border border-[#F4DAE4] rounded-2xl space-y-3">
                <div className="text-xs font-semibold text-[#9D2F5A]">
                  {t.home.brandLabel}
                </div>
                <div className="font-display text-2xl font-bold text-[#2A1620]">
                  {settings.brandName || 'ELHAM BEAUTY'}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {settings.tiktokUrl && (
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-4 py-2 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>TikTok</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#CC4B7C]" />
                    </a>
                  )}
                  {settings.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-4 py-2 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Instagram</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#CC4B7C]" />
                    </a>
                  )}
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-4 py-2 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Facebook</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#CC4B7C]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
