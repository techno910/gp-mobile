import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck2,
  ListChecks,
  MessageCircle,
  PhoneCall,
  Play,
  Radio,
} from 'lucide-react';
import {
  MediaGallerySlide,
  MediaGalleryTarget,
  ServiceItem,
  StoreProfile,
} from '../types/store';
import { buildTelUrl, buildWhatsAppUrl, formatRupees } from '../utils/formatters';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { ResolvedImage } from './ResolvedMedia';

interface SimServicesSectionProps {
  store: StoreProfile;
  services: ServiceItem[];
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

const OPERATORS = ['All', 'Jio', 'BSNL', 'Vi', 'Airtel'] as const;
type OperatorFilter = (typeof OPERATORS)[number];

interface ParsedPoint {
  num?: string;
  text: string;
}

function parseSimDescriptionPoints(raw?: string): ParsedPoint[] {
  const trimmed = (raw || '').trim();
  if (!trimmed) return [];

  // Split by newlines first, then also split inline numbered items if any (e.g. "1. Foo 2. Bar")
  const rawLines = trimmed
    .split(/\r?\n/)
    .flatMap((line) => line.split(/(?<=\S)\s+(?=\d{1,3}\.\s+)/))
    .map((l) => l.trim())
    .filter(Boolean);

  return rawLines.map((line) => {
    const match = line.match(/^(\d{1,3})[.)]\s*(.+)$/);
    if (match) {
      return { num: match[1].padStart(2, '0'), text: match[2].trim() };
    }
    const cleanBullet = line.replace(/^[-•*]\s+/, '').trim();
    return { text: cleanBullet };
  });
}

function getOperatorAccent(opName?: string): {
  headerBg: string;
  badgeBg: string;
  ringAccent: string;
  indexBg: string;
} {
  const op = (opName || '').toLowerCase();
  if (op.includes('jio')) {
    return {
      headerBg: 'from-[#0A256E] to-[#1D4ED8]',
      badgeBg: 'bg-blue-600 text-white',
      ringAccent: 'border-blue-200',
      indexBg: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }
  if (op.includes('airtel')) {
    return {
      headerBg: 'from-[#7F1D1D] to-[#DC2626]',
      badgeBg: 'bg-red-600 text-white',
      ringAccent: 'border-red-200',
      indexBg: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (op === 'vi' || op.includes('vodafone') || op.includes('idea')) {
    return {
      headerBg: 'from-[#581C87] to-[#BE185D]',
      badgeBg: 'bg-fuchsia-700 text-white',
      ringAccent: 'border-fuchsia-200',
      indexBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    };
  }
  if (op.includes('bsnl')) {
    return {
      headerBg: 'from-[#064E3B] to-[#059669]',
      badgeBg: 'bg-emerald-700 text-white',
      ringAccent: 'border-emerald-200',
      indexBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  return {
    headerBg: 'from-[#0A0F1C] to-[#1E293B]',
    badgeBg: 'bg-slate-900 text-white',
    ringAccent: 'border-slate-200',
    indexBg: 'bg-slate-100 text-slate-800 border-slate-200',
  };
}

interface SimStackedCardProps {
  service: ServiceItem;
  whatsappNumber?: string;
  callNumber?: string;
  shopName?: string;
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

function SimStackedCard({
  service,
  whatsappNumber,
  callNumber,
  shopName = 'GP MOBILE & CSC CENTRE',
  onOpenGallery,
}: SimStackedCardProps) {
  const [slideIdx, setSlideIdx] = useState(0);
  const accent = getOperatorAccent(service.operatorName);

  const priceDisplay =
    service.priceLabel?.trim() ||
    (service.feePaise && service.feePaise > 0
      ? formatRupees(service.feePaise)
      : 'Ask for Quote');

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
  const fallbackImage = '/src/assets/images/banner_csc_banking_1795451564569.jpg';

  const points = useMemo(
    () => parseSimDescriptionPoints(service.description),
    [service.description]
  );

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    `Hello ${shopName}, I would like to enquire about "${service.name}" (${
      service.operatorName || 'SIM Services'
    }).`
  );
  const telUrl = buildTelUrl(callNumber || whatsappNumber);

  const handleOpenMedia = (idx: number) => {
    const gallerySlides: MediaGallerySlide[] =
      slides.length > 0 ? slides : [{ type: 'image', src: fallbackImage }];
    onOpenGallery({
      title: service.name,
      subtitle: service.operatorName
        ? `SIM Services · ${service.operatorName}`
        : 'SIM Services',
      priceLabel: priceDisplay,
      slides: gallerySlides,
      initialIndex: idx,
      whatsappUrl,
      whatsappLabel: 'Enquire on WhatsApp',
    });
  };

  return (
    <article
      className={`bg-white border ${accent.ringAccent} rounded-3xl overflow-hidden shadow-[0_14px_38px_-18px_rgba(15,23,42,0.12)]`}
    >
      {/* Top Split: Media Carousel + Key Info & Direct Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch border-b border-slate-100">
        {/* Media Frame */}
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
          className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto lg:min-h-[260px] bg-slate-100 overflow-hidden cursor-pointer group"
        >
          {currentSlide?.type === 'video' ? (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white gap-2">
              <span className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Play SIM Service Video
              </span>
            </div>
          ) : (
            <ResolvedImage
              src={currentSlide?.src}
              fallbackSrc={fallbackImage}
              alt={`${service.operatorName || ''} ${service.name}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent pointer-events-none" />

          <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              SIM &amp; Telecom Service
            </span>
            {service.operatorName && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-extrabold shadow-sm ${accent.badgeBg}`}
              >
                <Radio className="w-3.5 h-3.5" />
                {service.operatorName}
              </span>
            )}
          </div>

          {service.videoUrlOrData && currentSlide?.type !== 'video' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenMedia(slides.length - 1);
              }}
              aria-label="Watch SIM service video"
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 text-white text-[11px] font-bold inline-flex items-center gap-1 hover:bg-slate-950"
            >
              <Play className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>Video</span>
            </button>
          )}

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
                }}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-slate-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Summary & Enquiry CTA */}
        <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                {service.operatorName && (
                  <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                    {service.operatorName} Official Desk
                  </p>
                )}
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">
                  {service.name}
                </h2>
              </div>
              <span className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 tabular-nums whitespace-nowrap">
                {priceDisplay}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Est. Time:{' '}
                  <strong className="text-slate-900">
                    {service.estimatedTime || 'Instant / Same Day'}
                  </strong>
                </span>
              </div>
              {service.requiredDocuments && (
                <div className="flex items-start gap-2">
                  <FileCheck2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Required Docs:{' '}
                    <strong className="text-slate-900">{service.requiredDocuments}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[170px] min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Enquire on WhatsApp</span>
            </a>
            <a
              href={telUrl}
              className="flex-1 min-w-[150px] min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0A0F1C] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Call Store Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Point-by-Point Vertical Single-Column Service List (One Point Below Another) */}
      {points.length > 0 && (
        <div className="p-5 sm:p-7 bg-slate-50/70">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-slate-700" />
              <h3 className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
                Available {service.operatorName || 'SIM'} Services Checklist ({points.length} Points)
              </h3>
            </div>
          </div>

          <ol className="flex flex-col divide-y divide-slate-200/80 bg-white border border-slate-200/80 rounded-2xl overflow-hidden">
            {points.map((pt, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 px-4 py-3 text-xs sm:text-sm text-slate-800 hover:bg-slate-50/80 transition-colors"
              >
                <span
                  className={`min-w-[28px] h-6 px-1.5 rounded-md border text-[11px] font-mono font-bold flex items-center justify-center shrink-0 tabular-nums ${accent.indexBg}`}
                >
                  {pt.num || String(idx + 1).padStart(2, '0')}
                </span>
                <span className="font-medium leading-relaxed pt-0.5 flex-1">
                  {pt.text}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
}

export function SimServicesSection({
  store,
  services,
  onOpenGallery,
}: SimServicesSectionProps) {
  const [operatorFilter, setOperatorFilter] = useState<OperatorFilter>('All');

  const simServices = useMemo(() => {
    const onlySim = services.filter((s) => s.category === 'SIM');
    if (operatorFilter === 'All') return onlySim;
    const targetLower = operatorFilter.toLowerCase();
    return onlySim.filter((s) => {
      const op = (s.operatorName || '').trim().toLowerCase();
      if (targetLower === 'vi') {
        return op === 'vi' || op.includes('vodafone') || op.includes('idea');
      }
      return op === targetLower || op.includes(targetLower);
    });
  }, [services, operatorFilter]);

  return (
    <div className="space-y-6">
      <ModuleAboutBanner
        text={store.moduleAbouts?.SIM_SERVICES}
        title="About SIM Services"
      />

      {/* SIM Services Hero Header */}
      <div className="rounded-3xl overflow-hidden border border-slate-800 bg-[#0A0F1C] text-white shadow-sm grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div
          className={`${
            store.sectionBanners?.SIM_SERVICES ? 'lg:col-span-7' : 'lg:col-span-12'
          } p-6 sm:p-9 space-y-5 flex flex-col justify-center`}
        >
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Radio className="w-4 h-4" />
              <span>Authorized Telecom &amp; MNP Activation Desk</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
              SIM Services — New SIM, MNP Port &amp; SIM Swap
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Instant e-KYC SIM activation, Mobile Number Portability (MNP), lost/damaged SIM replacement, and recharge plans for Jio, Airtel, Vi, and BSNL.
            </p>
          </div>

          {/* Operator Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {OPERATORS.map((op) => {
              const active = operatorFilter === op;
              return (
                <button
                  key={op}
                  type="button"
                  onClick={() => setOperatorFilter(op)}
                  className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    active
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/15'
                  }`}
                >
                  {op}
                </button>
              );
            })}
          </div>
        </div>

        {store.sectionBanners?.SIM_SERVICES && (
          <div className="lg:col-span-5 min-h-[190px] sm:min-h-[220px] relative">
            <ResolvedImage
              src={store.sectionBanners.SIM_SERVICES}
              alt="SIM Services & Telecom Activation Desk"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0F1C] via-transparent to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Single-Column Vertical Stack: One SIM Service Card After Another */}
      {simServices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <Radio className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-display text-base font-bold text-slate-900">
            No {operatorFilter === 'All' ? 'SIM Services' : `${operatorFilter} Services`} Listed Right Now
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try selecting All operators or contact our telecom desk via WhatsApp or Call for instant SIM &amp; MNP support.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {simServices.map((service) => (
            <SimStackedCard
              key={service.id}
              service={service}
              whatsappNumber={store.whatsappNumber}
              callNumber={store.callNumber}
              shopName={store.shopName}
              onOpenGallery={onOpenGallery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
