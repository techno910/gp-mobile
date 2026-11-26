import { useMemo, useState } from 'react';
import { Headphones } from 'lucide-react';
import { CatalogItem, MediaGalleryTarget, StoreProfile } from '../types/store';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { ProductCard } from './ProductCard';
import { ResolvedImage } from './ResolvedMedia';

interface AccessoriesSectionProps {
  store: StoreProfile;
  catalog: CatalogItem[];
  onSelectProduct: (item: CatalogItem) => void;
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

type AccessoryFilter = 'ALL' | 'ACCESSORY' | 'COVER';
type SortOption = 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC';

export function AccessoriesSection({
  store,
  catalog,
  onSelectProduct,
  onOpenGallery,
}: AccessoriesSectionProps) {
  const [filter, setFilter] = useState<AccessoryFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DEFAULT');

  const items = useMemo(() => {
    const base = catalog.filter(
      (item) => item.category === 'ACCESSORY' || item.category === 'COVER'
    );
    const filtered =
      filter === 'ALL' ? base : base.filter((item) => item.category === filter);

    if (sortBy === 'PRICE_ASC') {
      return [...filtered].sort((a, b) => a.sellingPricePaise - b.sellingPricePaise);
    }
    if (sortBy === 'PRICE_DESC') {
      return [...filtered].sort((a, b) => b.sellingPricePaise - a.sellingPricePaise);
    }
    return filtered;
  }, [catalog, filter, sortBy]);

  return (
    <div className="space-y-6">
      <ModuleAboutBanner
        text={store.moduleAbouts?.ACCESSORIES}
        title="About Mobile Accessories & Covers"
      />

      {/* Studio Banner */}
      <div className="rounded-3xl overflow-hidden bg-white border border-slate-200 grid grid-cols-1 lg:grid-cols-12 items-stretch shadow-xs">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Original Audio, Power &amp; Protection
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
              Mobile Accessories &amp; Designer Covers
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              GaN fast chargers, TWS earbuds, braided cables, edge-to-edge tempered glass, and precision-fit covers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              {(
                [
                  { id: 'ALL', label: 'All' },
                  { id: 'ACCESSORY', label: 'Accessories' },
                  { id: 'COVER', label: 'Mobile Covers' },
                ] as const
              ).map((chip) => {
                const active = filter === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setFilter(chip.id)}
                    className={`min-h-[36px] px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      active
                        ? 'bg-[#0A0F1C] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            <select
              aria-label="Sort accessories"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-slate-900"
            >
              <option value="DEFAULT">Sort: Featured</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-5 min-h-[180px] sm:min-h-[220px]">
          <ResolvedImage
            src={
              store.sectionBanners?.ACCESSORIES ||
              '/src/assets/images/dept_accessories_audio_1795478718231.jpg'
            }
            fallbackSrc="/src/assets/images/dept_accessories_audio_1795478718231.jpg"
            alt="Mobile Accessories and Covers"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <Headphones className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-display text-base font-bold text-slate-900">
            No Items Found in This Category
          </h2>
          <p className="text-sm text-slate-500">
            Switch filter to All or contact our store on WhatsApp for custom cover models.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              whatsappNumber={store.whatsappNumber}
              shopName={store.shopName}
              onSelect={onSelectProduct}
              onOpenGallery={onOpenGallery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
