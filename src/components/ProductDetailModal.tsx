import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Play,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { CatalogItem, MediaGallerySlide } from '../types/store';
import { buildWhatsAppUrl, calcDiscountPercent, formatRupees } from '../utils/formatters';
import { ResolvedImage, ResolvedVideo } from './ResolvedMedia';

interface ProductDetailModalProps {
  item: CatalogItem | null;
  whatsappNumber?: string;
  shopName?: string;
  onClose: () => void;
}

export function ProductDetailModal({
  item,
  whatsappNumber,
  shopName = 'GP MOBILE & CSC CENTRE',
  onClose,
}: ProductDetailModalProps) {
  const [slideIdx, setSlideIdx] = useState(0);

  const slides: MediaGallerySlide[] = useMemo(() => {
    if (!item) return [];
    const list: MediaGallerySlide[] = [];
    const images =
      item.galleryImages && item.galleryImages.length > 0
        ? item.galleryImages
        : item.imageDataUrl
        ? [item.imageDataUrl]
        : [];
    images.forEach((src) => {
      if (src.trim()) list.push({ type: 'image', src: src.trim() });
    });
    if (item.videoUrlOrData && item.videoUrlOrData.trim()) {
      list.push({ type: 'video', src: item.videoUrlOrData.trim() });
    }
    return list;
  }, [item]);

  useEffect(() => {
    setSlideIdx(0);
  }, [item?.id]);

  if (!item) return null;

  const stock = Number(item.stockCount ?? 0);
  const isOutOfStock = stock <= 0;
  const discount = calcDiscountPercent(item.mrpPaise, item.sellingPricePaise);
  const sellingFormatted = formatRupees(item.sellingPricePaise);
  const mrpFormatted = item.mrpPaise ? formatRupees(item.mrpPaise) : null;
  const activeSlide = slides[slideIdx] || slides[0];

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello ${shopName}, I would like to buy "${item.title}" (${sellingFormatted}). Please confirm availability.`
  );

  const specs: { label: string; value: string }[] = [];
  if (item.brand) specs.push({ label: 'Brand', value: item.brand });
  if (item.ramStorage) specs.push({ label: 'RAM / Storage', value: item.ramStorage });
  if (item.color) specs.push({ label: 'Color', value: item.color });
  if (item.condition) specs.push({ label: 'Condition', value: item.condition });
  if (item.batteryHealth) specs.push({ label: 'Battery Health', value: item.batteryHealth });
  if (item.warrantyLeft) specs.push({ label: 'Warranty Left', value: item.warrantyLeft });
  if (item.designType) specs.push({ label: 'Design / Type', value: item.designType });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Product Specification &amp; Media Gallery
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="min-h-[38px] min-w-[38px] rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Left Multi-Image + Video Gallery */}
          <div className="sm:col-span-5 space-y-3">
            <div className="relative aspect-square bg-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden flex items-center justify-center">
              {activeSlide ? (
                activeSlide.type === 'video' ? (
                  <ResolvedVideo src={activeSlide.src} className="w-full h-full object-contain bg-black" />
                ) : (
                  <ResolvedImage
                    src={activeSlide.src}
                    alt={item.title}
                    className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-55' : ''}`}
                  />
                )
              ) : (
                <Smartphone className="w-14 h-14 text-slate-300" />
              )}

              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length)}
                    aria-label="Previous media"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlideIdx((prev) => (prev + 1) % slides.length)}
                    aria-label="Next media"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {slides.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {slides.map((slide, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSlideIdx(idx)}
                    className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === slideIdx
                        ? 'border-amber-500'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {slide.type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center">
                        <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                      </div>
                    ) : (
                      <ResolvedImage
                        src={slide.src}
                        alt={`${item.title} thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-7 space-y-4">
            <div>
              <h2
                id="product-modal-title"
                className="font-display text-2xl font-bold text-slate-950 leading-snug"
              >
                {item.title}
              </h2>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl font-extrabold text-slate-950 tabular-nums">
                  {sellingFormatted}
                </span>
                {mrpFormatted && discount > 0 && (
                  <>
                    <span className="text-sm text-slate-400 line-through tabular-nums">
                      {mrpFormatted}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-3.5 text-xs font-semibold">
                {isOutOfStock ? (
                  <span className="text-red-600 font-bold">Out of Stock / Unavailable</span>
                ) : stock <= 3 ? (
                  <span className="text-amber-700 font-bold">Only {stock} Left in Store</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    In Stock &amp; Ready for Pickup
                  </span>
                )}
                {item.emiAvailable && !isOutOfStock && (
                  <span className="inline-flex items-center gap-1.5 text-blue-700">
                    <ShieldCheck className="w-4 h-4" />
                    Easy EMI Available
                  </span>
                )}
              </div>
            </div>

            {specs.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 border-y border-slate-100 text-xs">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="text-slate-400 font-medium">{spec.label}</dt>
                    <dd className="text-slate-900 font-semibold mt-0.5">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {item.description && (
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            )}

            <div className="pt-2">
              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  className="w-full h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-sm font-bold cursor-not-allowed"
                >
                  Out of Stock / Unavailable
                </button>
              ) : (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-12 rounded-xl bg-[#0A0F1C] hover:bg-slate-800 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                  Order / Enquire on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
