import { Home, Landmark, SearchCheck, Smartphone, Wrench } from 'lucide-react';
import { StoreTab } from '../types/store';

interface MobileBottomNavProps {
  activeTab: StoreTab;
  onTabSelect: (tab: StoreTab) => void;
}

const MOBILE_TABS: { id: StoreTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'mobiles', label: 'Mobiles', icon: Smartphone },
  { id: 'repair', label: 'Repair', icon: Wrench },
  { id: 'csc', label: 'CSC Seva', icon: Landmark },
  { id: 'tracker', label: 'Track', icon: SearchCheck },
];

export function MobileBottomNav({ activeTab, onTabSelect }: MobileBottomNavProps) {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 pb-safe shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
    >
      <div className="grid grid-cols-5 items-center h-14">
        {MOBILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabSelect(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-amber-600' : ''}`} />
              <span className="text-[10px] font-bold tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
