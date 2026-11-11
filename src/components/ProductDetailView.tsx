import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Category, Language, Product } from '../types.ts';
import { UI_STRINGS, formatTRY, pickList, pickText } from '../lib/i18n.ts';
import { SafeImage } from './SafeImage.tsx';
import { ProductCard } from './ProductCard.tsx';

interface ProductDetailViewProps {
  product: Product;
  categories: Category[];
  allProducts: Product[];
  lang: Language;
  onBack: () => void;
  onSelectProduct: (productId: string) => void;
  onOrderNow: (product: Product, quantity: number) => void;
}

export function ProductDetailView({
  product,
  categories,
  allProducts,
  lang,
  onBack,
  onSelectProduct,
  onOrderNow,
}: ProductDetailViewProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setActiveImageIdx(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const t = UI_STRINGS[lang].products;
  const isRtl = lang === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const category = categories.find((c) => c.id === product.categoryId);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const name = pickText(product.name, lang);
  const description = pickText(product.description, lang);
  const features = pickList(product.features, lang);
  const howToUse = pickText(product.howToUse, lang);

  const images = product.images.length > 0 ? product.images : [''];
  const activeImage = images[activeImageIdx] || images[0];

  const hasDiscount =
    product.originalPrice !== null && product.originalPrice > product.price;
  const savings = hasDiscount && product.originalPrice ? product.originalPrice - product.price : 0;

  const suggestedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const aSame = a.categoryId === product.categoryId ? 1 : 0;
      const bSame = b.categoryId === product.categoryId ? 1 : 0;
      return bSame - aSame;
    })
    .slice(0, 3);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6E515E] hover:text-[#CC4B7C] transition-colors cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{t.backToProducts}</span>
        </button>

        {/* Contiguous Purchase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Multi-Image Gallery */}
          <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
            <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#F4DAE4] bg-[#FFF9FB]">
              <SafeImage
                src={activeImage}
                alt={name}
                fallbackTitle={name}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors cursor-pointer bg-[#FFF9FB] ${
                      idx === activeImageIdx
                        ? 'border-[#CC4B7C]'
                        : 'border-[#F4DAE4] hover:border-[#E5A7BF]'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${name} ${idx + 1}`}
                      fallbackTitle={`${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Order CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3 pb-6 border-b border-[#F4DAE4]">
              <div className="flex items-center gap-2 text-xs font-medium text-[#9D2F5A]">
                {category && <span>{pickText(category.name, lang)}</span>}
                {category && <span aria-hidden="true">·</span>}
                <span>{product.inStock ? t.inStock : t.outOfStock}</span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2A1620] text-balance">
                {name}
              </h1>

              <div className="flex items-baseline gap-3 flex-wrap pt-1 tabular-nums">
                <span className="text-2xl sm:text-3xl font-bold text-[#2A1620]">
                  {formatTRY(product.price, lang)}
                </span>
                {hasDiscount && product.originalPrice && (
                  <span className="text-lg text-[#8F707E] line-through">
                    {formatTRY(product.originalPrice, lang)}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-xs font-semibold text-[#9D2F5A] bg-[#FCE8F0] px-2.5 py-1 rounded-md">
                    -{product.discountPercent}%
                    {savings > 0 ? ` · ${t.saveAmount} ${formatTRY(savings, lang)}` : ''}
                  </span>
                )}
              </div>
            </div>

            {description && (
              <p className="text-sm sm:text-base text-[#6E515E] leading-relaxed whitespace-pre-line">
                {description}
              </p>
            )}

            {features.length > 0 && (
              <div className="p-5 bg-[#FFF7FA] border border-[#F4DAE4] rounded-xl space-y-3">
                <h2 className="text-sm font-semibold text-[#2A1620]">{t.featuresTitle}</h2>
                <ul className="space-y-2">
                  {features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-[#6E515E]">
                      <Check className="w-4 h-4 text-[#CC4B7C] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {howToUse && (
              <div className="p-5 bg-white border border-[#F4DAE4] rounded-xl space-y-2">
                <h2 className="text-sm font-semibold text-[#2A1620]">{t.howToUseTitle}</h2>
                <p className="text-sm text-[#6E515E] leading-relaxed whitespace-pre-line">
                  {howToUse}
                </p>
              </div>
            )}

            {/* Quantity & Order Now */}
            <div className="pt-4 border-t border-[#F4DAE4] flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className="text-sm font-medium text-[#2A1620]">{t.quantityLabel}</span>
                <div className="inline-flex items-center border border-[#F4DAE4] rounded-lg bg-[#FFF9FB]">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#2A1620] hover:bg-[#FCE8F0] rounded-s-lg transition-colors cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-[#2A1620] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="w-11 h-11 flex items-center justify-center text-[#2A1620] hover:bg-[#FCE8F0] rounded-e-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOrderNow(product, quantity)}
                className="flex-1 min-h-[48px] px-7 py-3 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-base font-semibold rounded-lg inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t.orderNow}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        {suggestedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#F4DAE4]">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#2A1620] mb-8">
              {t.suggestedTitle}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  category={categoryMap.get(item.categoryId)}
                  lang={lang}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
