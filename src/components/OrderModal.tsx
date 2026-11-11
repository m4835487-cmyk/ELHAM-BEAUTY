import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Minus, Plus, X } from 'lucide-react';
import type { Language, Order, Product } from '../types.ts';
import {
  UI_STRINGS,
  buildWhatsAppOrderUrl,
  formatTRY,
  pickText,
} from '../lib/i18n.ts';
import { submitOrder } from '../lib/api.ts';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  initialProduct: Product | null;
  initialQuantity: number;
  storePhone: string;
  lang: Language;
}

export function OrderModal({
  isOpen,
  onClose,
  products,
  initialProduct,
  initialQuantity,
  storePhone,
  lang,
}: OrderModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedProductId(initialProduct?.id || products[0]?.id || '');
      setCustomProductName(initialProduct ? pickText(initialProduct.name, lang) : '');
      setQuantity(Math.max(1, initialQuantity || 1));
      setErrorMsg('');
      setConfirmedOrder(null);
    }
  }, [isOpen, initialProduct, initialQuantity, products, lang]);

  if (!isOpen) return null;

  const t = UI_STRINGS[lang].order;
  const activeProduct = products.find((p) => p.id === selectedProductId) || null;
  const displayProductName = activeProduct
    ? pickText(activeProduct.name, lang)
    : customProductName;
  const estimatedTotal = activeProduct ? activeProduct.price * quantity : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !country.trim() ||
      !governorate.trim() ||
      !city.trim() ||
      !district.trim() ||
      !detailedAddress.trim() ||
      (!activeProduct && !customProductName.trim())
    ) {
      setErrorMsg(t.requiredError);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await submitOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        country: country.trim(),
        governorate: governorate.trim(),
        city: city.trim(),
        district: district.trim(),
        detailedAddress: detailedAddress.trim(),
        productId: activeProduct?.id || '',
        productName: displayProductName.trim(),
        quantity,
        notes: notes.trim(),
      });
      setConfirmedOrder(res.order);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t.requiredError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1620]/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="bg-white border border-[#F4DAE4] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-[#F4DAE4] flex items-center justify-between gap-4">
          <div>
            <h2 id="order-modal-title" className="font-display text-2xl font-bold text-[#2A1620]">
              {confirmedOrder ? t.successTitle : t.title}
            </h2>
            {!confirmedOrder && (
              <p className="text-xs sm:text-sm text-[#6E515E] mt-0.5">{t.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            aria-label={t.close}
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-[#F4DAE4] bg-[#FFF7FA] text-[#2A1620] hover:bg-[#FCE8F0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Receipt */}
        {confirmedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FCE8F0] text-[#CC4B7C] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="text-xs font-semibold text-[#9D2F5A] tabular-nums">
                {t.orderNumberLabel}: {confirmedOrder.orderNumber}
              </div>
              <p className="text-sm sm:text-base text-[#6E515E] leading-relaxed">
                {t.successDesc}
              </p>
            </div>

            <div className="bg-[#FFF7FA] border border-[#F4DAE4] rounded-xl p-5 text-start space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-[#6E515E]">{t.product}:</span>
                <span className="font-semibold text-[#2A1620]">{confirmedOrder.productName}</span>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <span className="text-[#6E515E]">{t.quantity}:</span>
                <span className="font-semibold text-[#2A1620]">{confirmedOrder.quantity}</span>
              </div>
              {confirmedOrder.totalPrice > 0 && (
                <div className="flex justify-between gap-3 tabular-nums pt-2 border-t border-[#F4DAE4]">
                  <span className="text-[#6E515E]">{t.totalEstimate}:</span>
                  <span className="font-bold text-[#CC4B7C]">
                    {formatTRY(confirmedOrder.totalPrice, lang)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#F4DAE4] text-xs text-[#6E515E]">
                {confirmedOrder.fullName} · {confirmedOrder.phone} · {confirmedOrder.country},{' '}
                {confirmedOrder.governorate}, {confirmedOrder.city}, {confirmedOrder.district}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <a
                href={buildWhatsAppOrderUrl({
                  storePhone,
                  orderNumber: confirmedOrder.orderNumber,
                  fullName: confirmedOrder.fullName,
                  phone: confirmedOrder.phone,
                  country: confirmedOrder.country,
                  governorate: confirmedOrder.governorate,
                  city: confirmedOrder.city,
                  district: confirmedOrder.district,
                  detailedAddress: confirmedOrder.detailedAddress,
                  productName: confirmedOrder.productName,
                  quantity: confirmedOrder.quantity,
                  totalPrice: confirmedOrder.totalPrice,
                  notes: confirmedOrder.notes,
                  lang,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[46px] px-6 py-2.5 bg-[#CC4B7C] hover:bg-[#B43A69] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.sendWhatsapp}</span>
              </a>

              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] px-6 py-2.5 bg-white hover:bg-[#FFF7FA] border border-[#F4DAE4] text-[#2A1620] text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.phone} *
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.country} *
                </label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.governorate} *
                </label>
                <input
                  type="text"
                  required
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.city} *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.district} *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                {t.detailedAddress} *
              </label>
              <textarea
                rows={2}
                required
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.product} *
                </label>
                {products.length > 0 ? (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {pickText(p.name, lang)} ({formatTRY(p.price, lang)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    placeholder={t.customProductPlaceholder}
                    className="w-full min-h-[42px] px-3.5 py-2 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
                  />
                )}
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                  {t.quantity} *
                </label>
                <div className="inline-flex w-full items-center justify-between border border-[#F4DAE4] rounded-lg bg-[#FFF9FB]">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-[40px] flex items-center justify-center text-[#2A1620] hover:bg-[#FCE8F0] rounded-s-lg cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-[#2A1620] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                    className="w-10 h-[40px] flex items-center justify-center text-[#2A1620] hover:bg-[#FCE8F0] rounded-e-lg cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A1620] mb-1.5">
                {t.notes}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FFF9FB] border border-[#F4DAE4] rounded-lg text-sm text-[#2A1620] focus:outline-none focus:border-[#CC4B7C] focus:bg-white"
              />
            </div>

            {estimatedTotal > 0 && (
              <div className="p-3.5 bg-[#FFF7FA] border border-[#F4DAE4] rounded-xl flex items-center justify-between text-sm">
                <span className="text-[#6E515E]">{t.totalEstimate}</span>
                <span className="text-lg font-bold text-[#2A1620] tabular-nums">
                  {formatTRY(estimatedTotal, lang)}
                </span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-[#FFF7FA] border border-[#CC4B7C] rounded-lg text-xs font-medium text-[#9D2F5A]">
                {errorMsg}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] px-6 py-3 bg-[#CC4B7C] hover:bg-[#B43A69] disabled:opacity-60 text-white text-base font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {submitting ? t.submitting : t.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
