import { MapPin, MessageCircle, PhoneCall, Wrench } from 'lucide-react';
import { StoreProfile } from '../types/store';
import {
  buildTelUrl,
  buildWhatsAppUrl,
  DEFAULT_STORE_ADDRESS,
  GOOGLE_MAPS_DIRECTION_URL,
} from '../utils/formatters';

interface MaintenanceScreenProps {
  store: StoreProfile;
}

export function MaintenanceScreen({ store }: MaintenanceScreenProps) {
  const shopName = store.shopName || 'GP MOBILE & CSC CENTRE';
  const address = store.address || DEFAULT_STORE_ADDRESS;
  const whatsappUrl = buildWhatsAppUrl(
    store.whatsappNumber,
    `Hello ${shopName}, I saw your website is under maintenance and would like to enquire.`
  );
  const telUrl = buildTelUrl(store.callNumber || store.whatsappNumber);

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5">
          <Wrench className="w-7 h-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          {shopName}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-balance">
          Store Temporarily Under Maintenance
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
          We are updating our latest mobile inventory and service catalog. Our showroom and CSC desk are reopening online shortly — reach us directly anytime below.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <a
            href={telUrl}
            className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Call Store Now
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Chat
          </a>
        </div>

        <div className="pt-5 border-t border-slate-100 text-left flex items-start gap-3">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-semibold text-slate-800 mb-1">Showroom Address</p>
            <p>{address}</p>
            <a
              href={GOOGLE_MAPS_DIRECTION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1.5 font-semibold text-blue-600 hover:underline"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
