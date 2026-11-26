import {
  Award,
  Download,
  Headphones,
  Home,
  Landmark,
  MapPin,
  MessageCircle,
  PhoneCall,
  Radio,
  Search,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { StoreProfile, StoreTab } from '../types/store';
import { buildTelUrl, buildWhatsAppUrl } from '../utils/formatters';

interface StoreHeaderProps {
  store: StoreProfile;
  activeTab: StoreTab;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onTabSelect: (tab: StoreTab) => void;
}

const NAV_ITEMS: { id: StoreTab; label: string; icon: LucideIcon; accentClass: string }[] = [
  { id: 'home', label: 'Home', icon: Home, accentClass: 'text-amber-600' },
  { id: 'mobiles', label: 'Mobiles', icon: Smartphone, accentClass: 'text-blue-600' },
  { id: 'accessories', label: 'Accessories & Covers', icon: Headphones, accentClass: 'text-violet-600' },
  { id: 'repair', label: 'Mobile Repairing', icon: Wrench, accentClass: 'text-orange-600' },
  { id: 'csc', label: 'CSC & Banking', icon: Landmark, accentClass: 'text-emerald-600' },
  { id: 'sim', label: 'SIM Services', icon: Radio, accentClass: 'text-rose-600' },
  { id: 'downloads', label: 'Downloads', icon: Download, accentClass: 'text-sky-600' },
  { id: 'certificates', label: 'Certificates', icon: Award, accentClass: 'text-amber-600' },
  { id: 'tracker', label: 'Repair Tracker', icon: SearchCheck, accentClass: 'text-indigo-600' },
];

export function StoreHeader({
  store,
  activeTab,
  searchQuery,
  onSearchChange,
  onTabSelect,
}: StoreHeaderProps) {
  const shopName = store.shopName || 'GP MOBILE & CSC CENTRE';
  const telUrl = buildTelUrl(store.callNumber || store.whatsappNumber);
  const whatsappUrl = buildWhatsAppUrl(
    store.whatsappNumber,
    `Hello ${shopName}, I would like assistance from your online store.`
  );

  return (
    <header className="sticky top-0 z-40">
      {/* Top Desktop Trust Bar */}
      <div className="hidden lg:block bg-[#0A0F1C] text-slate-300 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-8 flex items-center justify-between text-[11px] font-medium">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Kallu Chowk, Pugmil Road, Hazaribag 825301
            </span>
            <span className="text-slate-600" aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Genuine Products &amp; Authorized CSC Point
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href={telUrl}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>Call Store</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp Desk</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Flagship Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_14px_rgba(15,23,42,0.05)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-6 py-2.5 lg:py-3">
            {/* Brand Mark */}
            <button
              type="button"
              onClick={() => onTabSelect('home')}
              className="flex items-center gap-2.5 text-left shrink-0 group min-h-[40px]"
            >
              <span className="w-9 h-9 rounded-xl bg-[#0A0F1C] text-amber-400 flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-900/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <rect
                    x="6.5"
                    y="2.5"
                    width="11"
                    height="19"
                    rx="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M10 18h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="8.5" r="1.75" fill="currentColor" />
                </svg>
              </span>
              <div className="min-w-0">
                <span className="block font-display text-sm sm:text-base font-extrabold tracking-tight text-slate-950 whitespace-nowrap group-hover:text-blue-700 transition-colors">
                  {shopName}
                </span>
                <span className="hidden sm:block text-[10px] font-semibold tracking-wider uppercase text-slate-500 whitespace-nowrap">
                  Flagship Mobile &amp; Digital Hub
                </span>
              </div>
            </button>

            {/* Primary Action: Track Repair */}
            <div className="flex items-center gap-2 lg:order-3 shrink-0">
              <button
                type="button"
                onClick={() => onTabSelect('tracker')}
                className={`min-h-[38px] px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                  activeTab === 'tracker'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-[#0A0F1C] text-white hover:bg-slate-800 shadow-xs'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Track Repair</span>
              </button>
            </div>

            {/* Architectural Global Search */}
            <div className="w-full lg:flex-1 lg:max-w-xl lg:order-2">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search smartphones, covers, repair, SIM, CSC forms..."
                  aria-label="Search store catalog and services"
                  className="w-full h-10 pl-10 pr-9 rounded-xl bg-slate-100/90 border border-slate-200/80 text-slate-900 text-sm placeholder:text-slate-500 focus:bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 p-1 rounded-md text-slate-500 hover:text-slate-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Single-Row Icon + Label Module Navigation Strip */}
          <nav
            aria-label="Storefront categories"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-100 py-1.5"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabSelect(item.id)}
                  className={`relative min-h-[38px] px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#0A0F1C] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-amber-500 text-slate-950' : `bg-slate-100 ${item.accentClass}`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-underline"
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="sr-only"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
