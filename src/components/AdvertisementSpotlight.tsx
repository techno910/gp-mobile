import React, { useState } from 'react';
import {
  ArrowUpRight,
  Flame,
  Megaphone,
  MessageCircle,
  Pencil,
  Sparkles,
  X,
} from 'lucide-react';
import { StoreProfile } from '../types/store';
import {
  buildWhatsAppUrl,
  getOfferThemeStyles,
  isOfferActive,
} from '../utils/formatters';

interface AdvertisementSpotlightProps {
  store: StoreProfile;
}

const LOCAL_AD_STORAGE_KEY = 'gp_store_custom_ad_preview_v1';

interface CustomAdDraft {
  headline: string;
  subtext: string;
  ctaLabel: string;
}

function loadCustomAd(): CustomAdDraft | null {
  try {
    const raw = localStorage.getItem(LOCAL_AD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CustomAdDraft>;
    if (parsed.headline && parsed.headline.trim()) {
      return {
        headline: parsed.headline.trim(),
        subtext: (parsed.subtext || '').trim(),
        ctaLabel: (parsed.ctaLabel || 'Claim Offer on WhatsApp').trim(),
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

interface TopOfferAnnouncementBarProps {
  store: StoreProfile;
  onOpenPopup?: () => void;
}

export function TopOfferAnnouncementBar({
  store,
  onOpenPopup,
}: TopOfferAnnouncementBarProps) {
  if (!isOfferActive(store)) return null;

  const theme = getOfferThemeStyles(store.offerTheme);
  const blinkOn = store.offerBlinkEnabled !== false;
  const badgeText = store.offerBadgeText?.trim() || '🔥 TODAY SPECIAL OFFER';
  const shopName = store.shopName || 'GP MOBILE & CSC CENTRE';
  const whatsappUrl = buildWhatsAppUrl(
    store.whatsappNumber,
    `Hello ${shopName}, I saw your special offer: "${store.offerBanner?.trim()}". Please share offer details!`
  );

  return (
    <div
      role="region"
      aria-label="Active Store Offer Announcement"
      style={{ '--offer-glow-color': theme.glowColor } as React.CSSProperties}
      className={`border-b text-white ${theme.topBarBg} ${
        blinkOn ? 'animate-offer-glow' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide whitespace-nowrap shrink-0 shadow-sm ${
              theme.badgeClass
            } ${blinkOn ? 'animate-offer-blink' : ''}`}
          >
            {badgeText}
          </span>
          <p className="font-display text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2 sm:line-clamp-1">
            {store.offerBanner?.trim()}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {store.offerEndDate && (
            <span className="hidden md:inline-block text-[11px] font-semibold text-white/85 whitespace-nowrap">
              Till {store.offerEndDate}
            </span>
          )}
          {onOpenPopup ? (
            <button
              type="button"
              onClick={onOpenPopup}
              className={`min-h-[32px] px-3 py-1 rounded-lg text-[11px] sm:text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-1 shadow-sm hover:brightness-105 transition-all ${theme.ctaClass}`}
            >
              <span>Claim Offer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-h-[32px] px-3 py-1 rounded-lg text-[11px] sm:text-xs font-extrabold whitespace-nowrap inline-flex items-center gap-1 shadow-sm hover:brightness-105 transition-all ${theme.ctaClass}`}
            >
              <span>Claim Offer</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdvertisementSpotlight({ store }: AdvertisementSpotlightProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [customAd, setCustomAd] = useState<CustomAdDraft | null>(() => loadCustomAd());

  const hasLiveOffer = isOfferActive(store);
  const shopName = store.shopName || 'GP MOBILE & CSC CENTRE';
  const theme = getOfferThemeStyles(store.offerTheme);
  const blinkOn = store.offerBlinkEnabled !== false;
  const badgeText = store.offerBadgeText?.trim() || '🔥 TODAY SPECIAL OFFER';

  const displayHeadline = hasLiveOffer
    ? store.offerBanner!.trim()
    : customAd?.headline ||
      'MEGA EXCHANGE & 5G SMARTPHONE DEALS — INSTANT CASHBACK & ZERO DOWN EMI!';

  const displaySubtext = hasLiveOffer
    ? store.offerEndDate
      ? `Limited-time live offer valid until ${store.offerEndDate}. Tap to claim or enquire on WhatsApp.`
      : 'Live store offer from GP MOBILE & CSC CENTRE. Tap to claim or enquire.'
    : customAd?.subtext ||
      'New & Certified Pre-Owned Mobiles, Same-Day Display Repair & Instant CSC Seva in Hazaribag.';

  const [draftHeadline, setDraftHeadline] = useState(displayHeadline);
  const [draftSubtext, setDraftSubtext] = useState(displaySubtext);

  const whatsappUrl = buildWhatsAppUrl(
    store.whatsappNumber,
    `Hello ${shopName}, I saw your featured offer: "${displayHeadline}". Please share full details!`
  );

  const handleOpenModal = () => {
    setDraftHeadline(customAd?.headline || displayHeadline);
    setDraftSubtext(customAd?.subtext || displaySubtext);
    setEditing(false);
    setModalOpen(true);
  };

  const handlePublishCustomAd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHead = draftHeadline.trim();
    const cleanSub = draftSubtext.trim();
    if (!cleanHead) return;
    const next: CustomAdDraft = {
      headline: cleanHead,
      subtext: cleanSub,
      ctaLabel: 'Claim Offer on WhatsApp',
    };
    setCustomAd(next);
    try {
      localStorage.setItem(LOCAL_AD_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage write errors
    }
    setEditing(false);
  };

  const handleResetCustomAd = () => {
    setCustomAd(null);
    try {
      localStorage.removeItem(LOCAL_AD_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    setEditing(false);
  };

  return (
    <>
      {/* Eye-Catching Blinking Offer Hero Spotlight */}
      <section aria-label="Featured Store Advertisement">
        <button
          type="button"
          onClick={handleOpenModal}
          style={{ '--offer-glow-color': theme.glowColor } as React.CSSProperties}
          className={`group w-full text-left relative rounded-3xl overflow-hidden p-[2px] transition-transform duration-200 hover:-translate-y-0.5 ${
            theme.frameGradient
          } ${blinkOn ? 'animate-offer-glow' : 'shadow-lg'}`}
        >
          <div
            className={`relative rounded-[22px] px-5 py-5 sm:px-8 sm:py-6 overflow-hidden ${theme.innerGradient}`}
          >
            {/* Subtle luminous mesh accents */}
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-amber-400/20 blur-2xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -left-10 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2.5 max-w-4xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${
                      theme.badgeClass
                    } ${blinkOn ? 'animate-offer-blink' : ''}`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{hasLiveOffer ? badgeText : 'FEATURED STORE AD'}</span>
                  </span>
                  {hasLiveOffer && store.offerEndDate && (
                    <span className="text-xs text-white/90 font-semibold">
                      Valid till {store.offerEndDate}
                    </span>
                  )}
                </div>

                <p
                  className={`font-display text-xl sm:text-3xl font-extrabold tracking-tight leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r ${theme.headlineGradient}`}
                >
                  {displayHeadline}
                </p>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed line-clamp-2">
                  {displaySubtext}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
                <span
                  className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-md group-hover:brightness-105 transition-all whitespace-nowrap ${theme.ctaClass}`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Grab Offer</span>
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </button>
      </section>

      {/* Interactive Advertisement Spotlight & Publish Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ad-spotlight-title"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
          >
            {/* Colorful Themed Modal Banner */}
            <div className={`relative p-6 sm:p-8 text-white ${theme.modalGradient}`}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close advertisement popup"
                className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-3">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${
                    theme.badgeClass
                  } ${blinkOn ? 'animate-offer-blink' : ''}`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>{hasLiveOffer ? badgeText : 'STORE ADVERTISEMENT'}</span>
                </span>
              </div>

              <h2
                id="ad-spotlight-title"
                className="font-display text-2xl sm:text-3xl font-extrabold leading-tight text-white"
              >
                {displayHeadline}
              </h2>

              <p className="mt-3 text-sm text-white/90 leading-relaxed">
                {displaySubtext}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {!editing ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[46px] px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Claim / Enquire on WhatsApp
                    </a>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="min-h-[46px] px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Publish / Edit Ad
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center">
                    Live offers published from the Store Admin App sync automatically.
                  </p>
                </>
              ) : (
                <form onSubmit={handlePublishCustomAd} className="space-y-3.5">
                  <div>
                    <label
                      htmlFor="ad-headline-input"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Advertisement Bold Headline
                    </label>
                    <input
                      id="ad-headline-input"
                      type="text"
                      required
                      maxLength={180}
                      value={draftHeadline}
                      onChange={(e) => setDraftHeadline(e.target.value)}
                      placeholder="Enter bold offer headline..."
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ad-subtext-input"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Advertisement Details
                    </label>
                    <textarea
                      id="ad-subtext-input"
                      rows={2}
                      maxLength={280}
                      value={draftSubtext}
                      onChange={(e) => setDraftSubtext(e.target.value)}
                      placeholder="Short offer details, discount, or validity..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="submit"
                      className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                    >
                      Publish Advertisement
                    </button>
                    {customAd && (
                      <button
                        type="button"
                        onClick={handleResetCustomAd}
                        className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                      >
                        Reset Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
