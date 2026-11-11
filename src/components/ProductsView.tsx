import { useMemo, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import type { Category, Language, Product } from '../types.ts';
import { UI_STRINGS, pickText } from '../lib/i18n.ts';
import { ProductCard } from './ProductCard.tsx';

interface ProductsViewProps {
  categories: Category[];
  products: Product[];
  lang: Language;
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectProduct: (productId: string) => void;
  onNavigateAdmin: () => void;
}

type SortMode = 'newest' | 'best' | 'priceAsc' | 'priceDesc';

export function ProductsView({
  categories,
  products,
  lang,
  selectedCategoryId,
  onSelectCategory,
  onSelectProduct,
  onNavigateAdmin,
}: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const t = UI_STRINGS[lang].products;
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
      if (!q) return true;
      const hay = [
        p.name.ar,
        p.name.tr,
        p.name.en,
        p.description.ar,
        p.description.tr,
        p.description.en,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });

    const sorted = [...list];
    if (sortMode === 'best') {
      sorted.sort((a, b) => Number(b.isBestSeller) - Number(a.isBestSeller));
    } else if (sortMode === 'priceAsc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'priceDesc') {
      sorted.sort((a, b) => b.price - a.price);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [products, selectedCategoryId, searchQuery, sortMode]);

  return (
    <section className="bg-white min-h-[70vh]">
      <div className="bg-[#FFF7FA] border-b border-[#F4DAE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14 space-y-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2A1620]">
              {t.title}
            </h1>
            <p className="text-sm sm:text-base text-[#6E515E]">{t.subtitle}</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap p-1 bg-white border border-[#F4DAE4] rounded-xl">
              <button
                type="button"
                onClick={() => onSelectCategory('')}
                className={`min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategoryId === ''
                    ? 'bg-[#CC4B7C] text-white'
                    : 'text-[#6E515E] hover:text-[#2A1620] hover:bg-[#FFF7FA]'
                }`}
              >
                {t.allCategories}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`min-h-[40px] px-4 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#CC4B7C] text-white'
                      : 'text-[#6E515E] hover:text-[#2A1620] hover:bg-[#FFF7FA]'
                  }`}
                >
                  {pickText(cat.name, lang)}
                </button>
              ))}
            </div>

            {/* Search & Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative min-w-[230px]">
                <Search className="w-4 h-4 text-[#CC4B7C] absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full min-h-[42px] ps-10 pe-3.5 py-2 bg-white border border-[#F4DAE4] rounded-xl text-sm text-[#2A1620] placeholder:text-[#9C7D8B] focus:outline-none focus:border-[#CC4B7C]"
                />
              </div>

              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                aria-label="Sort products"
                className="min-h-[42px] px-3.5 py-2 bg-white border border-[#F4DAE4] rounded-xl text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] cursor-pointer"
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="best">{t.sortBest}</option>
                <option value="priceAsc">{t.sortPriceAsc}</option>
                <option value="priceDesc">{t.sortPriceDesc}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                category={categoryMap.get(product.categoryId)}
                lang={lang}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#FFF7FA] border border-[#F4DAE4] rounded-2xl p-10 md:p-14 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-white border border-[#F4DAE4] mx-auto flex items-center justify-center text-[#CC4B7C]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#2A1620]">
              {t.emptyCategoryTitle}
            </h2>
            <p className="text-sm text-[#6E515E] leading-relaxed">{t.emptyCategoryDesc}</p>
            <div className="pt-2 flex justify-center gap-3">
              {selectedCategoryId && (
                <button
                  type="button"
                  onClick={() => onSelectCategory('')}
                  className="min-h-[42px] px-5 py-2 bg-white hover:bg-[#FCE8F0] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {t.allCategories}
                </button>
              )}
              <button
                type="button"
                onClick={onNavigateAdmin}
                className="min-h-[42px] px-5 py-2 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                {t.openAdminHint}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
