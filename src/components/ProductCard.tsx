import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, MessageCircle, Play, ShieldCheck, Smartphone } from 'lucide-react';
import { CatalogItem, MediaGallerySlide, MediaGalleryTarget } from '../types/store';
import {
  buildWhatsAppUrl,
  calcDiscountPercent,
  formatRupees,
} from '../utils/formatters';
import { ResolvedImage } from './ResolvedMedia';

interface ProductCardProps {
  item: CatalogItem;
  whatsappNumber?: string;
  shopName?: string;
  onSelect: (item: CatalogItem) => void;
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

export function ProductCard({
  item,
  whatsappNumber,
  shopName = 'GP MOBILE & CSC CENTRE',
  onSelect,
  onOpenGallery,
}: ProductCardProps) {
  const [slideIdx, setSlideIdx] = useState(0);

  const stock = Number(item.stockCount ?? 0);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock >= 1 && stock <= 3;
  const discount = calcDiscountPercent(item.mrpPaise, item.sellingPricePaise);
  const sellingFormatted = formatRupees(item.sellingPricePaise);
  const mrpFormatted = item.mrpPaise ? formatRupees(item.mrpPaise) : null;

  const isSecondHand = item.category === 'SECOND_HAND';
  const isNewPhone = item.category === 'NEW_PHONE';

  const slides: MediaGallerySlide[] = useMemo(() => {
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
  }, [item.galleryImages, item.imageDataUrl, item.videoUrlOrData]);

  const currentSlide = slides[slideIdx] || slides[0];

  const whatsappMessage = `Hello ${shopName}, I want to ${
    isNewPhone || isSecondHand ? 'buy' : 'order'
  } "${item.title}" listed at ${sellingFormatted}.${
    item.ramStorage ? ` Variant: ${item.ramStorage}.` : ''
  }${item.color ? ` Color: ${item.color}.` : ''}`;

  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage);

  const metaParts: string[] = [];
  if (item.brand) metaParts.push(item.brand);
  if (isNewPhone) {
    if (item.ramStorage) metaParts.push(item.ramStorage);
    if (item.color) metaParts.push(item.color);
  } else if (isSecondHand) {
    if (item.condition) metaParts.push(item.condition);
    if (item.batteryHealth) metaParts.push(`Battery ${item.batteryHealth}`);
    if (item.warrantyLeft) metaParts.push(`Warranty ${item.warrantyLeft}`);
  } else {
    if (item.designType) metaParts.push(item.designType);
    if (item.color) metaParts.push(item.color);
  }

  const openMediaAt = (idx: number) => {
    if (slides.length === 0) {
      onSelect(item);
      return;
    }
    onOpenGallery({
      title: item.title,
      subtitle: metaParts.join(' · '),
      priceLabel: sellingFormatted,
      slides,
      initialIndex: idx,
      whatsappUrl,
      whatsappLabel: isNewPhone || isSecondHand ? 'Buy on WhatsApp' : 'Order on WhatsApp',
      disabledAction: isOutOfStock,
      disabledLabel: 'Out of Stock / Unavailable',
    });
  };

  return (
    <article
      className={`group bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 ${
        isOutOfStock
          ? 'opacity-80'
          : 'hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] hover:border-slate-300'
      }`}
    >
      {/* Amazon/Flipkart Style Cut-to-Cut Multi-Media Frame */}
      <div
        onClick={() => openMediaAt(slideIdx)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openMediaAt(slideIdx);
          }
        }}
        className="relative aspect-[4/3] bg-slate-100 border-b border-slate-100 overflow-hidden cursor-pointer flex items-center justify-center"
      >
        {currentSlide ? (
          currentSlide.type === 'video' ? (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white gap-2">
              <span className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </span>
              <span className="text-xs font-bold tracking-wide uppercase text-amber-300">
                Play Product Video
              </span>
            </div>
          ) : (
            <ResolvedImage
              src={currentSlide.src}
              alt={item.title}
              fallbackLabel={item.brand || item.title}
              className={`w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04] ${
                isOutOfStock ? 'grayscale opacity-55' : ''
              }`}
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200/60 flex flex-col items-center justify-center text-slate-400 gap-2 p-3">
            <Smartphone className="w-9 h-9" />
            <span className="text-[11px] font-semibold text-slate-500 text-center line-clamp-1">
              {item.brand || item.title}
            </span>
          </div>
        )}

        {/* Single Clean Tag */}
        {isOutOfStock ? (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold shadow-xs">
            Out of Stock / Unavailable
          </span>
        ) : discount > 0 ? (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold tabular-nums shadow-xs">
            {discount}% OFF
          </span>
        ) : null}

        {/* Video badge if product has video */}
        {item.videoUrlOrData && currentSlide?.type !== 'video' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openMediaAt(slides.length - 1);
            }}
            aria-label="Watch product video"
            className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-slate-950/80 text-white text-[10px] font-bold inline-flex items-center gap-1 hover:bg-slate-950 transition-colors"
          >
            <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Video</span>
          </button>
        )}

        {/* Carousel Prev/Next Controls on Card */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
              }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((prev) => (prev + 1) % slides.length);
              }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Bottom Dot Indicators */}
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1 pointer-events-none">
              {slides.map((s, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === slideIdx
                      ? 'w-4 bg-amber-400 shadow-xs'
                      : s.type === 'video'
                      ? 'w-1.5 bg-white/90'
                      : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Specification & Price Module */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
        <div className="space-y-1.5">
          {metaParts.length > 0 && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              {metaParts.join(' · ')}
            </p>
          )}

          <button
            type="button"
            onClick={() => onSelect(item)}
            className="text-left w-full"
          >
            <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
              {item.title}
            </h3>
          </button>

          {/* Price Baseline */}
          <div className="pt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <span className="font-display text-lg sm:text-xl font-extrabold text-slate-950 tabular-nums">
              {sellingFormatted}
            </span>
            {mrpFormatted && discount > 0 && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                {mrpFormatted}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold pt-0.5">
            {isLowStock ? (
              <span className="text-amber-700 font-bold">Only {stock} Left</span>
            ) : !isOutOfStock ? (
              <span className="text-emerald-700">In Stock</span>
            ) : null}

            {item.emiAvailable && !isOutOfStock && (
              <span className="inline-flex items-center gap-1 text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                EMI Available
              </span>
            )}
          </div>
        </div>

        {/* Action CTA + Quick Spec View */}
        <div className="flex items-center gap-2">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed"
            >
              Out of Stock / Unavailable
            </button>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-[#0A0F1C] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">
                {isNewPhone || isSecondHand ? 'Buy on WhatsApp' : 'Order on WhatsApp'}
              </span>
            </a>
          )}
          <button
            type="button"
            onClick={() => onSelect(item)}
            aria-label={`View details for ${item.title}`}
            className="min-h-[42px] w-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
