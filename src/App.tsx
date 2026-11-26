import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AccessoriesSection } from './components/AccessoriesSection';
import { CertificatesSection } from './components/CertificatesSection';
import { CscBankingSection } from './components/CscBankingSection';
import { DownloadsSection } from './components/DownloadsSection';
import { EntryVisitorModal } from './components/EntryVisitorModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeSection } from './components/HomeSection';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { MediaGalleryModal } from './components/MediaGalleryModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobilesSection } from './components/MobilesSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RepairSection } from './components/RepairSection';
import { RepairTrackerSection } from './components/RepairTrackerSection';
import { SearchResultsView } from './components/SearchResultsView';
import { SimServicesSection } from './components/SimServicesSection';
import { StoreFooter } from './components/StoreFooter';
import { StoreHeader } from './components/StoreHeader';
import { useStoreData } from './hooks/useStoreData';
import {
  CatalogItem,
  MediaGalleryTarget,
  MobilesSubTab,
  StoreTab,
} from './types/store';

const ENTRY_MODAL_SESSION_KEY = 'gp_store_entry_modal_dismissed';

function StorefrontContent() {
  const { store, catalog, services, downloads, certificates, loading, errorMessage } =
    useStoreData();

  const [activeTab, setActiveTab] = useState<StoreTab>('home');
  const [mobilesSubTab, setMobilesSubTab] = useState<MobilesSubTab>('NEW_PHONE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [galleryTarget, setGalleryTarget] = useState<MediaGalleryTarget | null>(null);
  const [trackerPrefill, setTrackerPrefill] = useState('');
  const [entryModalOpen, setEntryModalOpen] = useState(false);

  useEffect(() => {
    if (loading || store.isWebsiteLive === false) return;
    try {
      const dismissed = sessionStorage.getItem(ENTRY_MODAL_SESSION_KEY);
      if (dismissed !== '1') {
        setEntryModalOpen(true);
      }
    } catch {
      setEntryModalOpen(true);
    }
  }, [loading, store.isWebsiteLive]);

  const handleCloseEntryModal = () => {
    setEntryModalOpen(false);
    try {
      sessionStorage.setItem(ENTRY_MODAL_SESSION_KEY, '1');
    } catch {
      // Ignore storage failures in restricted contexts
    }
  };

  const handleTabSelect = (tab: StoreTab, subTab?: MobilesSubTab) => {
    setActiveTab(tab);
    if (subTab) {
      setMobilesSubTab(subTab);
    }
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickTrack = (query: string) => {
    setTrackerPrefill(query);
    setActiveTab('tracker');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!loading && store.isWebsiteLive === false) {
    return <MaintenanceScreen store={store} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900">
      <StoreHeader
        store={store}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onTabSelect={(tab) => handleTabSelect(tab)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-9">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900">
            Live sync notice: Some store data could not be loaded cleanly. Please check connection or contact our counter on WhatsApp.
          </div>
        )}

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-28 rounded-3xl bg-slate-200/90" />
            <div className="h-64 sm:h-80 rounded-3xl bg-slate-200/90" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-44 rounded-2xl bg-slate-200/80" />
              ))}
            </div>
          </div>
        ) : searchQuery.trim().length > 0 ? (
          <SearchResultsView
            query={searchQuery}
            store={store}
            catalog={catalog}
            services={services}
            downloads={downloads}
            onClearSearch={() => setSearchQuery('')}
            onSelectProduct={setSelectedProduct}
            onOpenGallery={setGalleryTarget}
            onTabSelect={(tab) => handleTabSelect(tab)}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'home' && (
                <HomeSection
                  store={store}
                  catalog={catalog}
                  services={services}
                  onTabSelect={handleTabSelect}
                  onSelectProduct={setSelectedProduct}
                  onOpenGallery={setGalleryTarget}
                  onQuickTrack={handleQuickTrack}
                />
              )}

              {activeTab === 'mobiles' && (
                <MobilesSection
                  store={store}
                  catalog={catalog}
                  subTab={mobilesSubTab}
                  onSubTabChange={setMobilesSubTab}
                  onSelectProduct={setSelectedProduct}
                  onOpenGallery={setGalleryTarget}
                />
              )}

              {activeTab === 'accessories' && (
                <AccessoriesSection
                  store={store}
                  catalog={catalog}
                  onSelectProduct={setSelectedProduct}
                  onOpenGallery={setGalleryTarget}
                />
              )}

              {activeTab === 'repair' && (
                <RepairSection
                  store={store}
                  services={services}
                  onTabSelect={(tab) => handleTabSelect(tab)}
                  onOpenGallery={setGalleryTarget}
                />
              )}

              {activeTab === 'csc' && (
                <CscBankingSection
                  store={store}
                  services={services}
                  onOpenGallery={setGalleryTarget}
                />
              )}

              {activeTab === 'sim' && (
                <SimServicesSection
                  store={store}
                  services={services}
                  onOpenGallery={setGalleryTarget}
                />
              )}

              {activeTab === 'downloads' && (
                <DownloadsSection store={store} downloads={downloads} />
              )}

              {activeTab === 'certificates' && (
                <CertificatesSection store={store} certificates={certificates} />
              )}

              {activeTab === 'tracker' && (
                <RepairTrackerSection initialQuery={trackerPrefill} />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <StoreFooter store={store} onTabSelect={(tab) => handleTabSelect(tab)} />

      <MobileBottomNav
        activeTab={activeTab}
        onTabSelect={(tab) => handleTabSelect(tab)}
      />

      <EntryVisitorModal
        isOpen={entryModalOpen}
        shopName={store.shopName || 'GP MOBILE & CSC CENTRE'}
        onClose={handleCloseEntryModal}
      />

      <ProductDetailModal
        item={selectedProduct}
        whatsappNumber={store.whatsappNumber}
        shopName={store.shopName}
        onClose={() => setSelectedProduct(null)}
      />

      <MediaGalleryModal
        target={galleryTarget}
        onClose={() => setGalleryTarget(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StorefrontContent />
    </ErrorBoundary>
  );
}
