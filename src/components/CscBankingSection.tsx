import { useMemo, useState } from 'react';
import { Landmark } from 'lucide-react';
import { MediaGalleryTarget, ServiceItem, StoreProfile } from '../types/store';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { ResolvedImage } from './ResolvedMedia';
import { ServiceCard } from './ServiceCard';

interface CscBankingSectionProps {
  store: StoreProfile;
  services: ServiceItem[];
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

type CscFilter = 'ALL' | 'CSC' | 'BANKING';

export function CscBankingSection({
  store,
  services,
  onOpenGallery,
}: CscBankingSectionProps) {
  const [filter, setFilter] = useState<CscFilter>('ALL');

  // Strictly show ONLY CSC and BANKING (exclude SIM and REPAIR)
  const items = useMemo(() => {
    const base = services.filter(
      (s) => s.category === 'CSC' || s.category === 'BANKING'
    );
    if (filter === 'ALL') return base;
    return base.filter((s) => s.category === filter);
  }, [services, filter]);

  return (
    <div className="space-y-6">
      <ModuleAboutBanner
        text={store.moduleAbouts?.CSC_BANKING}
        title="About CSC & Banking Seva"
      />

      {/* Banner */}
      <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-xs">
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-700">
            <Landmark className="w-4 h-4" />
            <span>Authorized Digital Seva &amp; Banking Point</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
            CSC Services &amp; Banking Seva
          </h1>
          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            PAN card, certificates, e-district applications, Aadhaar-enabled cash withdrawal (AEPS), money transfer, and utility bill payments with clear document checklists.
          </p>
          <div className="pt-1">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'CSC', label: 'CSC Services' },
                  { id: 'BANKING', label: 'Banking Seva' },
                ] as const
              ).map((tab) => {
                const active = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilter(tab.id)}
                    className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      active
                        ? 'bg-[#0A0F1C] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 min-h-[200px]">
          <ResolvedImage
            src={
              store.sectionBanners?.CSC_BANKING ||
              '/src/assets/images/banner_csc_banking_1795451564569.jpg'
            }
            fallbackSrc="/src/assets/images/banner_csc_banking_1795451564569.jpg"
            alt="GP CSC and Banking Seva Desk"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Cards */}
      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <Landmark className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-display text-base font-bold text-slate-900">
            No Services Listed Under This Filter
          </h2>
          <p className="text-sm text-slate-500">
            Switch to All or message our CSC desk on WhatsApp for any citizen or banking assistance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {items.map((service) => (
            <ServiceCard
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
