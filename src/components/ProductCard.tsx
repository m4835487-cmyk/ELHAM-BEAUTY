import { Eye } from 'lucide-react';
import type { Category, Language, Product } from '../types.ts';
import { UI_STRINGS, formatTRY, pickText } from '../lib/i18n.ts';
import { SafeImage } from './SafeImage.tsx';

interface ProductCardProps {
  product: Product;
  category?: Category;
  lang: Language;
  onSelect: (productId: string) => void;
}

export function ProductCard({ product, category, lang, onSelect }: ProductCardProps) {
  const t = UI_STRINGS[lang].products;
  const name = pickText(product.name, lang);
  const categoryName = category ? pickText(category.name, lang) : '';
  const hasDiscount =
    (product.originalPrice && product.originalPrice > product.price) ||
    product.discountPercent > 0;

  return (
    <article className="group bg-white border border-[#F4DAE4] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(204,75,124,0.08)]">
      {/* 4:3 Image Container */}
      <button
        type="button"
        onClick={() => onSelect(product.id)}
        className="relative aspect-[4/3] w-full bg-[#FFF9FB] overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CC4B7C]"
      >
        <SafeImage
          src={product.images[0]}
          alt={name}
          fallbackTitle={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {hasDiscount && product.discountPercent > 0 && (
          <span className="absolute top-3 start-3 bg-[#CC4B7C] text-white text-xs font-semibold px-2.5 py-1 rounded-md tabular-nums">
            -{product.discountPercent}%
          </span>
        )}
      </button>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          {categoryName && (
            <div className="text-xs font-medium text-[#9D2F5A] tracking-wide">
              {categoryName}
            </div>
          )}
          <h3 className="text-base font-semibold text-[#2A1620] leading-snug line-clamp-2">
            <button
              type="button"
              onClick={() => onSelect(product.id)}
              className="text-start hover:text-[#CC4B7C] transition-colors cursor-pointer"
            >
              {name}
            </button>
          </h3>
        </div>

        <div className="space-y-3 pt-2 border-t border-[#F8E6EE]">
          <div className="flex items-baseline gap-2.5 flex-wrap tabular-nums">
            <span className="text-lg font-bold text-[#2A1620]">
              {formatTRY(product.price, lang)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-[#8F707E] line-through">
                {formatTRY(product.originalPrice, lang)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelect(product.id)}
            className="w-full min-h-[42px] px-4 py-2 bg-[#FFF7FA] hover:bg-[#CC4B7C] text-[#2A1620] hover:text-white border border-[#F4DAE4] hover:border-[#CC4B7C] rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t.viewProduct}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
