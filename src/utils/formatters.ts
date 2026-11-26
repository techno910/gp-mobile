import { OfferTheme, StoreProfile } from '../types/store';

export const DEFAULT_STORE_ADDRESS =
  'Opposite Laxmi Market, Near V-Mart, Pugmil Road, Kallu Chowk, Hazaribag 825301';

export const GOOGLE_MAPS_DIRECTION_URL =
  'https://maps.google.com/?q=Opposite+Laxmi+Market+Near+V-Mart+Pugmil+Road+Kallu+Chowk+Hazaribag+825301';

export function paiseToRupees(paise?: number | string | null): number {
  const numeric = Number(paise);
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;
  return Math.round(numeric / 100);
}

export function formatRupees(paise?: number | string | null): string {
  const rupees = paiseToRupees(paise);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

export function calcDiscountPercent(mrpPaise?: number, sellingPaise?: number): number {
  const mrp = Number(mrpPaise || 0);
  const sell = Number(sellingPaise || 0);
  if (mrp <= 0 || sell <= 0 || mrp <= sell) return 0;
  return Math.round(((mrp - sell) / mrp) * 100);
}

export function getLocalTodayYYYYMMDD(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getIstTodayYYYYMMDD(date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    // Fallback to IST offset (+05:30)
  }
  const istDate = new Date(date.getTime() + 330 * 60 * 1000);
  return istDate.toISOString().slice(0, 10);
}

export function formatLocalTimeLabel(date = new Date()): string {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

export function isOfferActive(store: StoreProfile): boolean {
  const banner = (store.offerBanner || '').trim();
  if (!banner) return false;
  const today = getIstTodayYYYYMMDD();
  const start = (store.offerStartDate || '').trim();
  const end = (store.offerEndDate || '').trim();
  const afterStart = !start || today >= start;
  const beforeEnd = !end || today <= end;
  return afterStart && beforeEnd;
}

export interface OfferThemeStyles {
  frameGradient: string;
  innerGradient: string;
  modalGradient: string;
  topBarBg: string;
  badgeClass: string;
  headlineGradient: string;
  ctaClass: string;
  glowColor: string;
}

export function getOfferThemeStyles(theme?: OfferTheme | string): OfferThemeStyles {
  const normalized = String(theme || 'CRIMSON_GOLD').toUpperCase().trim();
  switch (normalized) {
    case 'SAFFRON_FIRE':
      return {
        frameGradient: 'bg-gradient-to-r from-orange-500 via-amber-400 to-red-600',
        innerGradient: 'bg-gradient-to-r from-[#431407] via-[#9A3412] to-[#7F1D1D]',
        modalGradient: 'bg-gradient-to-br from-[#7C2D12] via-[#C2410C] to-[#991B1B]',
        topBarBg: 'bg-gradient-to-r from-[#7C2D12] via-[#C2410C] to-[#9A3412] border-amber-400/50',
        badgeClass: 'bg-amber-300 text-slate-950 ring-2 ring-white/50',
        headlineGradient: 'from-white via-amber-100 to-yellow-200',
        ctaClass: 'bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-950',
        glowColor: 'rgba(249, 115, 22, 0.72)',
      };
    case 'EMERALD_NEON':
      return {
        frameGradient: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-400',
        innerGradient: 'bg-gradient-to-r from-[#022C22] via-[#065F46] to-[#064E3B]',
        modalGradient: 'bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#0F766E]',
        topBarBg: 'bg-gradient-to-r from-[#022C22] via-[#065F46] to-[#047857] border-emerald-300/50',
        badgeClass: 'bg-lime-300 text-slate-950 ring-2 ring-white/50',
        headlineGradient: 'from-white via-emerald-100 to-lime-200',
        ctaClass: 'bg-gradient-to-r from-lime-300 to-emerald-300 text-slate-950',
        glowColor: 'rgba(16, 185, 129, 0.72)',
      };
    case 'ROYAL_PURPLE':
      return {
        frameGradient: 'bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400',
        innerGradient: 'bg-gradient-to-r from-[#1E1B4B] via-[#4C1D95] to-[#701A75]',
        modalGradient: 'bg-gradient-to-br from-[#312E81] via-[#6D28D9] to-[#86198F]',
        topBarBg: 'bg-gradient-to-r from-[#1E1B4B] via-[#5B21B6] to-[#701A75] border-fuchsia-300/45',
        badgeClass: 'bg-amber-300 text-slate-950 ring-2 ring-white/50',
        headlineGradient: 'from-white via-amber-200 to-fuchsia-200',
        ctaClass: 'bg-gradient-to-r from-amber-300 to-orange-400 text-slate-950',
        glowColor: 'rgba(168, 85, 247, 0.72)',
      };
    case 'CRIMSON_GOLD':
    default:
      return {
        frameGradient: 'bg-gradient-to-r from-rose-600 via-amber-400 to-red-700',
        innerGradient: 'bg-gradient-to-r from-[#450A0A] via-[#881337] to-[#7F1D1D]',
        modalGradient: 'bg-gradient-to-br from-[#7F1D1D] via-[#9F1239] to-[#78350F]',
        topBarBg: 'bg-gradient-to-r from-[#450A0A] via-[#991B1B] to-[#7F1D1D] border-amber-400/55',
        badgeClass: 'bg-amber-400 text-slate-950 ring-2 ring-amber-200/70',
        headlineGradient: 'from-white via-amber-100 to-amber-300',
        ctaClass: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950',
        glowColor: 'rgba(225, 29, 72, 0.75)',
      };
  }
}

export function normalizePhoneDigits(phone?: string): string {
  const raw = (phone || '').replace(/\D/g, '');
  if (!raw) return '';
  if (raw.length === 10) return `91${raw}`;
  if (raw.startsWith('0') && raw.length === 11) return `91${raw.slice(1)}`;
  return raw;
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string {
  const digits = normalizePhoneDigits(phone);
  const encoded = encodeURIComponent(message);
  if (!digits) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${digits}?text=${encoded}`;
}

export function buildTelUrl(phone: string | undefined): string {
  const cleaned = (phone || '').replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : '#contact-footer';
}

export function clampString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

/**
 * Extracts latitude/longitude coordinates from Google Maps URLs containing
 * @lat,lng, ?q=lat,lng, or !3dlat!4dlng. Falls back to the store address.
 */
export function extractMapLocationInfo(
  mapLinkUrl?: string,
  address?: string
): {
  embedUrl: string;
  directionsUrl: string;
  coordinates: string | null;
  resolvedAddress: string;
} {
  const resolvedAddress = (address || '').trim() || DEFAULT_STORE_ADDRESS;
  const rawUrl = (mapLinkUrl || '').trim();

  let coordinates: string | null = null;

  if (rawUrl) {
    // 1. Check !3dLAT!4dLNG
    const d3d4 = rawUrl.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
    // 2. Check @LAT,LNG
    const atCoords = rawUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    // 3. Check ?q=LAT,LNG or &q=LAT,LNG or query=LAT,LNG or ll=LAT,LNG
    const qCoords = rawUrl.match(
      /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/
    );

    const matched = d3d4 || atCoords || qCoords;
    if (matched) {
      coordinates = `${matched[1]},${matched[2]}`;
    }
  }

  const embedQuery = coordinates || resolvedAddress;
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    embedQuery
  )}&output=embed`;

  const directionsUrl =
    rawUrl && /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://maps.google.com/?q=${encodeURIComponent(embedQuery)}`;

  return {
    embedUrl,
    directionsUrl,
    coordinates,
    resolvedAddress,
  };
}

/**
 * Compresses an uploaded image file to JPEG <= maxBytes (default 180 KB)
 * and guarantees data URL string length < 250,000 chars for Firestore lead rules.
 */
export async function compressImageToJpegDataUrl(
  file: File,
  maxBytes = 180 * 1024
): Promise<{ dataUrl: string; approxBytes: number }> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Unable to decode selected image.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Image compression is not supported in this browser.');
  }

  let maxDim = 1024;
  let quality = 0.82;

  for (let attempt = 0; attempt < 8; attempt++) {
    const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64Part = dataUrl.split(',')[1] || '';
    const approxBytes = Math.ceil((base64Part.length * 3) / 4);

    if (approxBytes <= maxBytes && dataUrl.length < 245000) {
      return { dataUrl, approxBytes };
    }

    if (quality > 0.45) {
      quality -= 0.12;
    } else {
      maxDim = Math.round(maxDim * 0.72);
      quality = 0.65;
    }
  }

  const finalScale = Math.min(1, 480 / Math.max(image.width, image.height));
  canvas.width = Math.max(1, Math.round(image.width * finalScale));
  canvas.height = Math.max(1, Math.round(image.height * finalScale));
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const fallbackUrl = canvas.toDataURL('image/jpeg', 0.45);
  const base64Part = fallbackUrl.split(',')[1] || '';
  const approxBytes = Math.ceil((base64Part.length * 3) / 4);
  if (fallbackUrl.length >= 250000) {
    throw new Error('Selected image is too large even after compression. Please pick a smaller photo.');
  }
  return { dataUrl: fallbackUrl, approxBytes };
}
