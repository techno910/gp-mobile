import { Search, X } from 'lucide-react';
import {
  CatalogItem,
  DownloadItem,
  MediaGalleryTarget,
  ServiceItem,
  StoreProfile,
  StoreTab,
} from '../types/store';
import { ProductCard } from './ProductCard';
import { ServiceCard } from './ServiceCard';

interface SearchResultsViewProps {
  query: string;
  store: StoreProfile;
  catalog: CatalogItem[];
  services: ServiceItem[];
  downloads: DownloadItem[];
  onClearSearch: () => void;
  onSelectProduct: (item: CatalogItem) => void;
  onOpenGallery: (target: MediaGalleryTarget) => void;
  onTabSelect: (tab: StoreTab) => void;
}

export function SearchResultsView({
  query,
  store,
  catalog,
  services,
  downloads,
  onClearSearch,
  onSelectProduct,
  onOpenGallery,
  onTabSelect,
}: SearchResultsViewProps) {
  const q = query.trim().toLowerCase();

  const matchedProducts = catalog.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      (item.brand || '').toLowerCase().includes(q) ||
      (item.ramStorage || '').toLowerCase().includes(q) ||
      (item.designType || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q)
  );

  const matchedServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.operatorName || '').toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q) ||
      (s.requiredDocuments || '').toLowerCase().includes(q)
  );

  const matchedDownloads = downloads.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q) ||
      (d.category || '').toLowerCase().includes(q)
  );

  const totalCount =
    matchedProducts.length + matchedServices.length + matchedDownloads.length;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Search className="w-5 h-5 text-blue-600" />
          <div>
            <h1 className="font-display text-lg font-bold text-slate-900">
              Search Results for &ldquo;{query.trim()}&rdquo;
            </h1>
            <p className="text-xs text-slate-500">
              Found {totalCount} matching {totalCount === 1 ? 'result' : 'results'} across products, services, and downloads
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClearSearch}
          className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5"
        >
          <X className="w-4 h-4" />
          Clear Search
        </button>
      </div>

      {totalCount === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
          <p className="font-display text-base font-bold text-slate-900">
            No matching items found
          </p>
          <p className="text-sm text-slate-500">
            Try searching with another phone model, SIM operator, accessory name, or service keyword.
          </p>
        </div>
      )}

      {matchedProducts.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Products ({matchedProducts.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {matchedProducts.map((item) => (
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
        </section>
      )}

      {matchedServices.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Repair, SIM &amp; CSC Services ({matchedServices.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {matchedServices.map((service) => (
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
        </section>
      )}

      {matchedDownloads.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Matching PDFs ({matchedDownloads.length})
            </h2>
            <button
              type="button"
              onClick={() => {
                onClearSearch();
                onTabSelect('downloads');
              }}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              Open Downloads Tab
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matchedDownloads.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  onClearSearch();
                  onTabSelect('downloads');
                }}
                className="bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-blue-400 transition-colors"
              >
                <h3 className="font-display text-sm font-bold text-slate-900">
                  {d.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {d.category || 'PDF Form'}
                  {d.fileSizeLabel ? ` · ${d.fileSizeLabel}` : ''}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
