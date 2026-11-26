import { SearchCheck, Wrench } from 'lucide-react';
import { MediaGalleryTarget, ServiceItem, StoreProfile, StoreTab } from '../types/store';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { ResolvedImage } from './ResolvedMedia';
import { ServiceCard } from './ServiceCard';

interface RepairSectionProps {
  store: StoreProfile;
  services: ServiceItem[];
  onTabSelect: (tab: StoreTab) => void;
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

export function RepairSection({
  store,
  services,
  onTabSelect,
  onOpenGallery,
}: RepairSectionProps) {
  // Strictly show ONLY category === "REPAIR" (exclude SIM, CSC, BANKING)
  const repairServices = services.filter((s) => s.category === 'REPAIR');

  return (
    <div className="space-y-6">
      <ModuleAboutBanner
        text={store.moduleAbouts?.REPAIR}
        title="About Mobile Repairing"
      />

      {/* Studio Workshop Banner */}
      <div className="rounded-3xl overflow-hidden border border-slate-800 bg-[#0A0F1C] text-white grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-sm">
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Wrench className="w-4 h-4" />
            <span>Certified Repair Lab</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
            Mobile Repairing &amp; Hardware Diagnostics
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Display replacement, genuine battery swap, charging port restoration, software flashing, and motherboard micro-soldering with transparent upfront estimates.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onTabSelect('tracker')}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-2 transition-colors"
            >
              <SearchCheck className="w-4 h-4" />
              Track Existing Repair Job
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 min-h-[200px] relative">
          <ResolvedImage
            src={
              store.sectionBanners?.REPAIR ||
              '/src/assets/images/banner_repair_lab_1795451564640.jpg'
            }
            fallbackSrc="/src/assets/images/banner_repair_lab_1795451564640.jpg"
            alt="GP Mobile Repair Lab"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0F1C] via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Services Grid */}
      {repairServices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-display text-base font-bold text-slate-900">
            Repair Services Catalog Updating
          </h2>
          <p className="text-sm text-slate-500">
            Reach us on WhatsApp or visit our Kallu Chowk counter for instant repair quotes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {repairServices.map((service) => (
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
