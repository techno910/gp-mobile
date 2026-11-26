import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck2,
  MessageCircle,
  PhoneCall,
  Play,
  Radio,
} from 'lucide-react';
import { MediaGallerySlide, MediaGalleryTarget, ServiceItem } from '../types/store';
import { buildTelUrl, buildWhatsAppUrl, formatRupees } from '../utils/formatters';
import { ResolvedImage } from './ResolvedMedia';

interface ServiceCardProps {
  service: ServiceItem;
  whatsappNumber?: string;
  callNumber?: string;
  shopName?: string;
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

export function ServiceCard({
  service,
  whatsappNumber,
  callNumber,
  shopName = 'GP MOBILE & CSC CENTRE',
  onOpenGallery,
}: ServiceCardProps) {
  const [slideIdx, setSlideIdx] = useState(0);

  const isRepair = service.category === 'REPAIR';
  const isSim = service.category === 'SIM';

  const fallbackImage = isRepair
    ? '/src/assets/images/banner_repair_lab_1795451564640.jpg'
    : '/src/assets/images/banner_csc_banking_1795451564569.jpg';

  const priceDisplay =
    service.priceLabel?.trim() ||
    (service.feePaise && service.feePaise > 0
      ? formatRupees(service.feePaise)
      : 'Ask for Quote');

  const categoryLabel = isRepair
    ? 'Mobile Repairing'
    : isSim
    ? 'SIM Services'
    : service.category === 'BANKING'
    ? 'Banking Seva'
    : 'CSC Service';

  const slides: MediaGallerySlide[] = useMemo(() => {
    const list: MediaGallerySlide[] = [];
    const images =
      service.galleryImages && service.galleryImages.length > 0
        ? service.galleryImages
        : service.imageDataUrl
        ? [service.imageDataUrl]
        : [];
    images.forEach((src) => {
      if (src.trim()) list.push({ type: 'image', src: src.trim() });
    });
    if (service.videoUrlOrData && service.videoUrlOrData.trim()) {
      list.push({ type: 'video', src: service.videoUrlOrData.trim() });
    }
    return list;
  }, [service.galleryImages, service.imageDataUrl, service.videoUrlOrData]);

  const currentSlide = slides[slideIdx] || slides[0];

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello ${shopName}, I would like to ${
      isRepair ? 'book / enquire about' : 'enquire about'
    } "${service.name}" (${categoryLabel}${
      service.operatorName ? ` - ${service.operatorName}` : ''
    }).`
  );
  const telUrl = buildTelUrl(callNumber || whatsappNumber);

  const handleOpenMedia = (idx: number) => {
    const gallerySlides: MediaGallerySlide[] =
      slides.length > 0 ? slides : [{ type: 'image', src: fallbackImage }];
    onOpenGallery({
      title: service.name,
      subtitle: service.operatorName
        ? `${categoryLabel} · ${service.operatorName}`
        : categoryLabel,
      priceLabel: priceDisplay,
      slides: gallerySlides,
      initialIndex: idx,
      whatsappUrl,
      whatsappLabel: isRepair ? 'Book / Enquire on WhatsApp' : 'Enquire on WhatsApp',
    });
  };

  return (
    <article className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.12)] hover:border-slate-300 transition-all duration-200">
      {/* Multi-Media Carousel Header */}
      <div
        onClick={() => handleOpenMedia(slideIdx)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenMedia(slideIdx);
          }
        }}
        className="relative aspect-[16/10] bg-slate-100 border-b border-slate-100 overflow-hidden cursor-pointer"
      >
        {currentSlide?.type === 'video' ? (
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white gap-2">
            <span className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Play Service Video
            </span>
          </div>
        ) : (
          <ResolvedImage
            src={currentSlide?.src}
            fallbackSrc={fallbackImage}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent pointer-events-none" />

        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
            {categoryLabel}
          </span>
          {service.operatorName && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/95 text-slate-950 text-[11px] font-extrabold shadow-xs">
              <Radio className="w-3 h-3 text-blue-600" />
              {service.operatorName}
            </span>
          )}
        </div>

        {/* Video badge */}
        {service.videoUrlOrData && currentSlide?.type !== 'video' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenMedia(slides.length - 1);
            }}
            aria-label="Watch service video"
            className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-slate-950/80 text-white text-[10px] font-bold inline-flex items-center gap-1 hover:bg-slate-950 transition-colors"
          >
            <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Video</span>
          </button>
        )}

        {/* Carousel Controls */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
              }}
              aria-label="Previous slide"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((prev) => (prev + 1) % slides.length);
              }}
              aria-label="Next slide"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute top-2.5 left-3 flex items-center gap-1 pointer-events-none">
              {slides.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === slideIdx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/65'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Specification Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {service.name}
            </h3>
            <span className="font-display text-base sm:text-lg font-extrabold text-slate-950 whitespace-nowrap tabular-nums shrink-0">
              {priceDisplay}
            </span>
          </div>

          <div className="space-y-1.5 py-2.5 border-y border-slate-100 text-xs text-slate-600">
            {service.estimatedTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Est. Time: <strong className="text-slate-900">{service.estimatedTime}</strong>
                </span>
              </div>
            )}
            {service.requiredDocuments && (
              <div className="flex items-start gap-2">
                <FileCheck2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Docs: <strong className="text-slate-900">{service.requiredDocuments}</strong>
                </span>
              </div>
            )}
          </div>

          {service.description && (
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-4">
              {service.description}
            </div>
          )}
        </div>

        {isSim ? (
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[42px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
            </a>
            <a
              href={telUrl}
              className="min-h-[42px] px-3 py-2 rounded-xl bg-[#0A0F1C] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Call Enquiry</span>
            </a>
          </div>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isRepair ? 'Book / Enquire on WhatsApp' : 'Enquire on WhatsApp'}</span>
          </a>
        )}
      </div>
    </article>
  );
}
