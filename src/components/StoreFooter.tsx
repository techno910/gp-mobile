import { ExternalLink, MapPin, MessageCircle, Navigation, PhoneCall, Store } from 'lucide-react';
import { StoreProfile, StoreTab } from '../types/store';
import {
  buildTelUrl,
  buildWhatsAppUrl,
  extractMapLocationInfo,
} from '../utils/formatters';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { ResolvedImage } from './ResolvedMedia';

interface StoreFooterProps {
  store: StoreProfile;
  onTabSelect: (tab: StoreTab) => void;
}

export function StoreFooter({ store, onTabSelect }: StoreFooterProps) {
  const shopName = store.shopName || 'GP MOBILE & CSC CENTRE';
  const { embedUrl, directionsUrl, coordinates, resolvedAddress } =
    extractMapLocationInfo(store.mapLinkUrl, store.address);

  const whatsappUrl = buildWhatsAppUrl(
    store.whatsappNumber,
    `Hello ${shopName}, I visited your online storefront and have an enquiry.`
  );
  const telUrl = buildTelUrl(store.callNumber || store.whatsappNumber);

  return (
    <footer
      id="contact-footer"
      className="bg-[#0A0F1C] text-slate-300 border-t border-slate-800 pb-20 lg:pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {/* Auto-Published Contact About Card */}
        <ModuleAboutBanner
          text={store.moduleAbouts?.CONTACT}
          title="About Our Store & Location"
          dark
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Brand & Direct Contact */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-extrabold tracking-tight">
                  {shopName}
                </h2>
                <p className="text-xs text-slate-400">
                  {store.tagline || 'Smartphones, Repair Lab & CSC Banking Hub'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-sm text-slate-300 pt-1">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <p className="leading-relaxed">{resolvedAddress}</p>
            </div>

            {(store.sectionBanners?.CONTACT || store.shopPhotoUrl) && (
              <div className="rounded-2xl overflow-hidden border border-white/15 aspect-[16/9] bg-slate-900">
                <ResolvedImage
                  src={store.sectionBanners?.CONTACT || store.shopPhotoUrl}
                  alt={`${shopName} Storefront`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2.5 pt-2">
              <a
                href={telUrl}
                className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                Call Now
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Chat
              </a>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Store Sections */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white">
              Store Departments
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('mobiles')}
                  className="hover:text-white transition-colors"
                >
                  New &amp; Second Hand Mobiles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('accessories')}
                  className="hover:text-white transition-colors"
                >
                  Accessories &amp; Covers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('repair')}
                  className="hover:text-white transition-colors"
                >
                  Mobile Repairing Lab
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('csc')}
                  className="hover:text-white transition-colors"
                >
                  CSC &amp; Banking Seva
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('sim')}
                  className="hover:text-white transition-colors"
                >
                  SIM Services (Jio / Airtel / Vi / BSNL)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('tracker')}
                  className="hover:text-white transition-colors"
                >
                  Live Repair Tracker
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('downloads')}
                  className="hover:text-white transition-colors"
                >
                  Official PDF Downloads
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onTabSelect('certificates')}
                  className="hover:text-white transition-colors"
                >
                  Verified Certificates
                </button>
              </li>
            </ul>
          </div>

          {/* Auto-Formatted Interactive Google Maps Location Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/15 shadow-lg">
              <div className="aspect-[16/9] w-full bg-slate-900 relative">
                <iframe
                  title={`${shopName} Google Maps Location`}
                  src={embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full border-0"
                />
              </div>

              <div className="p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Showroom Location
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    {coordinates ? `GPS ${coordinates}` : 'GPS Verified Pin'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {resolvedAddress}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>
                  <a
                    href={telUrl}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {shopName}. All rights reserved.</p>
          <p>Hazaribag, Jharkhand · Genuine Smartphones &amp; Digital Citizen Services</p>
        </div>
      </div>
    </footer>
  );
}
