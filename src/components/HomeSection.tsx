import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BadgeIndianRupee,
  Download,
  Landmark,
  MapPin,
  MessageCircle,
  PhoneCall,
  Radio,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Store,
  UserRound,
  Wrench,
} from 'lucide-react';
import {
  CatalogItem,
  MediaGalleryTarget,
  ServiceItem,
  StoreProfile,
  StoreTab,
} from '../types/store';
import { buildTelUrl, buildWhatsAppUrl, DEFAULT_STORE_ADDRESS } from '../utils/formatters';
import { AdvertisementSpotlight } from './AdvertisementSpotlight';
import { StructuredAboutContent } from './ModuleAboutBanner';
import { ProductCard } from './ProductCard';
import { ResolvedImage } from './ResolvedMedia';
import { ServiceCard } from './ServiceCard';

interface HomeSectionProps {
  store: StoreProfile;
  catalog: CatalogItem[];
  services: ServiceItem[];
  onTabSelect: (tab: StoreTab, subTab?: 'NEW_PHONE' | 'SECOND_HAND' | 'SELL_PHONE') => void;
  onSelectProduct: (item: CatalogItem) => void;
  onOpenGallery: (target: MediaGalleryTarget) => void;
  onQuickTrack: (query: string) => void;
}

export function HomeSection({
  store,
  catalog,
  services,
  onTabSelect,
  onSelectProduct,
  onOpenGallery,
  onQuickTrack,
}: HomeSectionProps) {
  const [quickTrackInput, setQuickTrackInput] = useState('');

  const shopName = store.shopName || 'GP MOBILE & CSC CENTRE';
  const heroImageSrc =
    store.sectionBanners?.HOME || '/src/assets/images/hero_mobile_showroom_1795451563067.jpg';
  const shopShowcaseSrc =
    store.shopPhotoUrl ||
    store.sectionBanners?.HOME ||
    '/src/assets/images/hero_mobile_showroom_1795451563067.jpg';

  const homeAboutText = (store.moduleAbouts?.HOME || '').trim();

  const telUrl = buildTelUrl(store.callNumber || store.whatsappNumber);
  const whatsappUrl = buildWhatsAppUrl(
    store.whatsappNumber,
    `Hello ${shopName}, I visited your online store and would like to connect.`
  );

  const trendingProducts = catalog
    .filter((item) => Number(item.stockCount) > 0)
    .slice(0, 8);
  const displayProducts =
    trendingProducts.length > 0 ? trendingProducts : catalog.slice(0, 8);

  const featuredServices = services.slice(0, 6);

  const featuredDepartments: {
    title: string;
    subtitle: string;
    image: string;
    tab: StoreTab;
    subTab?: 'NEW_PHONE' | 'SECOND_HAND' | 'SELL_PHONE';
  }[] = [
    {
      title: 'Flagship Smartphones',
      subtitle: 'Latest 5G & Sealed Box Deals',
      image:
        store.sectionBanners?.MOBILE_SALES ||
        '/src/assets/images/dept_flagship_phones_1795478716255.jpg',
      tab: 'mobiles',
      subTab: 'NEW_PHONE',
    },
    {
      title: 'Accessories & Covers',
      subtitle: 'GaN Chargers, Audio & Cases',
      image:
        store.sectionBanners?.ACCESSORIES ||
        '/src/assets/images/dept_accessories_audio_1795478718231.jpg',
      tab: 'accessories',
    },
    {
      title: 'Precision Repair Lab',
      subtitle: 'Display, Battery & IC Diagnostics',
      image:
        store.sectionBanners?.REPAIR ||
        '/src/assets/images/banner_repair_lab_1795451564640.jpg',
      tab: 'repair',
    },
    {
      title: 'CSC & Banking Seva',
      subtitle: 'AEPS, PAN & Citizen Services',
      image:
        store.sectionBanners?.CSC_BANKING ||
        '/src/assets/images/banner_csc_banking_1795451564569.jpg',
      tab: 'csc',
    },
  ];

  const utilityShortcuts: {
    label: string;
    detail: string;
    icon: typeof Smartphone;
    tab: StoreTab;
    subTab?: 'NEW_PHONE' | 'SECOND_HAND' | 'SELL_PHONE';
  }[] = [
    {
      label: 'SIM Services',
      detail: 'Jio, Airtel, Vi, BSNL & MNP',
      icon: Radio,
      tab: 'sim',
    },
    {
      label: 'Second Hand Mobiles',
      detail: 'Battery & warranty verified units',
      icon: Smartphone,
      tab: 'mobiles',
      subTab: 'SECOND_HAND',
    },
    {
      label: 'Sell Your Old Phone',
      detail: 'Upload photo for instant quote',
      icon: BadgeIndianRupee,
      tab: 'mobiles',
      subTab: 'SELL_PHONE',
    },
    {
      label: 'Official Downloads',
      detail: 'View & download PDF forms',
      icon: Download,
      tab: 'downloads',
    },
    {
      label: 'Verified Certificates',
      detail: 'Authorized CSC & store credentials',
      icon: Award,
      tab: 'certificates',
    },
  ];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackInput.trim()) {
      onQuickTrack(quickTrackInput.trim());
    } else {
      onTabSelect('tracker');
    }
  };

  return (
    <div className="space-y-9 sm:space-y-11">
      {/* Eye-Catching Blinking Advertisement / Offer Spotlight */}
      <AdvertisementSpotlight store={store} />

      {/* Expansive Flagship Hero Stage + 4-Column Trust Strip */}
      <section className="space-y-4">
        <div className="relative rounded-3xl overflow-hidden bg-[#0A0F1C] text-white shadow-[0_24px_60px_-20px_rgba(10,15,28,0.45)] border border-slate-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-center space-y-5 relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
                Hazaribag Flagship Showroom &amp; CSC Hub
              </p>
              <h1
                className="font-display font-extrabold tracking-tight leading-[1.08] text-white"
                style={{ fontSize: 'clamp(1.85rem, 3.6vw, 3.15rem)', textWrap: 'balance' }}
              >
                {shopName}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                {store.tagline ||
                  'Genuine new & certified pre-owned smartphones, chip-level repair engineering, SIM activation, original accessories, and authorized digital governance & banking services.'}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onTabSelect('mobiles', 'NEW_PHONE')}
                  className="min-h-[46px] px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold inline-flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Explore Smartphones</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onTabSelect('sim')}
                  className="min-h-[46px] px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-sm font-semibold transition-colors"
                >
                  SIM Services
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative min-h-[220px] sm:min-h-[300px] lg:min-h-[380px]">
              <ResolvedImage
                src={heroImageSrc}
                fallbackSrc="/src/assets/images/hero_mobile_showroom_1795451563067.jpg"
                alt={`${shopName} Flagship Showroom`}
                className="w-full h-full object-cover lg:h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0F1C] via-[#0A0F1C]/35 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Trust Pillars Below Hero Split */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Genuine GST Billing',
              desc: '100% sealed-box & certified devices',
            },
            {
              icon: Wrench,
              title: 'Same-Day Repair Lab',
              desc: 'Live job card status tracking',
            },
            {
              icon: Landmark,
              title: 'Authorized CSC & AEPS',
              desc: 'Banking & citizen e-services',
            },
            {
              icon: Radio,
              title: 'Instant SIM & MNP',
              desc: 'Jio, Airtel, Vi & BSNL desk',
            },
          ].map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center gap-3"
              >
                <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {pillar.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{pillar.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Premium Shop Storefront & Owner Showcase (shopPhotoUrl, ownerPhotoUrl, moduleAbouts.HOME) */}
      <section
        aria-labelledby="shop-owner-showcase-heading"
        className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Shop Storefront Photo */}
          <div className="lg:col-span-6 relative min-h-[240px] sm:min-h-[300px] lg:min-h-[340px] bg-slate-100">
            <ResolvedImage
              src={shopShowcaseSrc}
              fallbackSrc="/src/assets/images/hero_mobile_showroom_1795451563067.jpg"
              fallbackIcon={<Store className="w-12 h-12" />}
              fallbackLabel={shopName}
              alt={`${shopName} Storefront`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                Visit Our Storefront
              </p>
              <p className="font-display text-lg sm:text-xl font-bold mt-0.5 leading-snug">
                {shopName}
              </p>
              <p className="text-xs text-slate-200 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{store.address || DEFAULT_STORE_ADDRESS}</span>
              </p>
            </div>
          </div>

          {/* Owner Portrait Card & About Description */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-xs">
                  <ResolvedImage
                    src={store.ownerPhotoUrl}
                    alt={`${shopName} Owner`}
                    fallbackIcon={<UserRound className="w-10 h-10 text-slate-400" />}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                    Store &amp; Owner Profile
                  </p>
                  <h2
                    id="shop-owner-showcase-heading"
                    className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight"
                  >
                    {shopName}
                  </h2>
                  {store.tagline && (
                    <p className="text-xs sm:text-sm font-medium text-slate-500">
                      {store.tagline}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                {homeAboutText ? (
                  <StructuredAboutContent text={homeAboutText} collapsedBlocksCount={5} />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Welcome to GP MOBILE &amp; CSC CENTRE — your trusted neighbourhood destination for brand-new and certified pre-owned smartphones, chip-level mobile repair, SIM activation &amp; MNP, genuine accessories, and authorized CSC &amp; banking services.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <a
                href={telUrl}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0A0F1C] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Call Counter</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Store</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Photo Department Showcase + Utility Shortcuts */}
      <section aria-labelledby="departments-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Store Departments
            </p>
            <h2
              id="departments-heading"
              className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5"
            >
              Everything Mobile, SIM &amp; Digital Seva
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredDepartments.map((dept) => (
            <button
              key={dept.title}
              type="button"
              onClick={() => onTabSelect(dept.tab, dept.subTab)}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden text-left border border-slate-200 shadow-xs hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <ResolvedImage
                src={dept.image}
                alt={dept.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                <p className="font-display text-base sm:text-lg font-bold leading-tight">
                  {dept.title}
                </p>
                <p className="text-xs text-slate-200 mt-1 flex items-center justify-between gap-2">
                  <span>{dept.subtitle}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* 5 Secondary Utility Tiles including dedicated SIM Services */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {utilityShortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => onTabSelect(shortcut.tab, shortcut.subTab)}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 text-left hover:border-slate-400 hover:-translate-y-0.5 hover:shadow-sm transition-all flex items-center gap-3"
              >
                <span className="w-10 h-10 rounded-xl bg-[#0A0F1C] text-amber-400 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {shortcut.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {shortcut.detail}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trending Products & New Arrivals */}
      <section aria-labelledby="trending-heading" className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Live Counter Inventory
            </p>
            <h2
              id="trending-heading"
              className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5"
            >
              Trending Products &amp; New Arrivals
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onTabSelect('mobiles', 'NEW_PHONE')}
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>Browse All Mobiles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {displayProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-sm text-slate-500">
            New products are being synced from our showroom counter. Check back shortly or ping us on WhatsApp.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {displayProducts.map((item) => (
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
      </section>

      {/* Quick Repair Status Tracker Bar */}
      <section
        aria-labelledby="quick-tracker-heading"
        className="rounded-3xl bg-[#0A0F1C] text-white p-6 sm:p-8 border border-slate-800 shadow-sm"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <SearchCheck className="w-4 h-4" />
              <span>Real-Time Repair Status</span>
            </div>
            <h2
              id="quick-tracker-heading"
              className="font-display text-xl sm:text-2xl font-extrabold text-white"
            >
              Track Your Repair Job Instantly
            </h2>
            <p className="text-sm text-slate-300">
              Enter your Repair Job ID or 10-digit Mobile Number to inspect live progress from intake to pickup.
            </p>
          </div>

          <form
            onSubmit={handleTrackSubmit}
            className="lg:col-span-6 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={quickTrackInput}
              onChange={(e) => setQuickTrackInput(e.target.value)}
              placeholder="Enter Job ID (e.g. JOB-102) or Mobile Number"
              className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold whitespace-nowrap transition-colors"
            >
              Check Status
            </button>
          </form>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section aria-labelledby="featured-services-heading" className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Repair, SIM &amp; Citizen Desk
              </p>
              <h2
                id="featured-services-heading"
                className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 mt-0.5"
              >
                Featured Store Services
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onTabSelect('repair')}
              className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-700 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <span>Explore All Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredServices.map((service) => (
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
    </div>
  );
}
