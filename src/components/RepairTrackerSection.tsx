import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Check, Search, Smartphone, Wrench } from 'lucide-react';
import { db, STORE_ID } from '../lib/firebase';
import { PublicRepairResult, RepairStatus } from '../types/store';

interface RepairTrackerSectionProps {
  initialQuery?: string;
}

const REPAIR_STEPS: { key: RepairStatus; label: string; subtitle: string }[] = [
  { key: 'RECEIVED', label: 'Received', subtitle: 'Device checked in at desk' },
  { key: 'IN_REPAIR', label: 'In Repair', subtitle: 'Technician working on device' },
  { key: 'READY', label: 'Ready', subtitle: 'Ready for pickup' },
  { key: 'DELIVERED', label: 'Delivered', subtitle: 'Handed over to customer' },
];

function normalizeStatus(raw: unknown): RepairStatus {
  const val = String(raw || '').toUpperCase().trim();
  if (val === 'IN_REPAIR' || val === 'REPAIRING') return 'IN_REPAIR';
  if (val === 'READY' || val === 'COMPLETED') return 'READY';
  if (val === 'DELIVERED') return 'DELIVERED';
  return 'RECEIVED';
}

function getStepIndex(status: RepairStatus): number {
  const idx = REPAIR_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function RepairTrackerSection({ initialQuery = '' }: RepairTrackerSectionProps) {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<PublicRepairResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runSearch = async (rawQuery: string) => {
    const clean = rawQuery.trim();
    if (!clean) {
      setErrorMsg('Please enter a Repair Job ID or 10-digit Mobile Number.');
      return;
    }

    setSearching(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const trackerRef = collection(db, 'public_stores', STORE_ID, 'repair_tracker');
      const digitsOnly = clean.replace(/\D/g, '');
      const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

      const matchedMap = new Map<string, PublicRepairResult>();

      const addSanitizedDoc = (docId: string, d: Record<string, unknown>) => {
        matchedMap.set(docId, {
          id: docId,
          jobCardNumber: String(d.jobCardNumber || docId),
          deviceModel: String(d.deviceModel || 'Mobile Device'),
          status: normalizeStatus(d.status),
        });
      };

      const queryVariants = [
        query(trackerRef, where('jobCardNumber', '==', clean)),
        query(trackerRef, where('jobCardNumber', '==', clean.toUpperCase())),
        query(trackerRef, where('customerMobile', '==', clean)),
      ];
      if (last10.length >= 6) {
        queryVariants.push(query(trackerRef, where('customerMobile', '==', last10)));
        queryVariants.push(query(trackerRef, where('customerMobile', '==', `+91${last10}`)));
      }

      const settled = await Promise.allSettled(queryVariants.map((q) => getDocs(q)));
      settled.forEach((res) => {
        if (res.status === 'fulfilled') {
          res.value.forEach((docSnap) => {
            addSanitizedDoc(docSnap.id, docSnap.data() as Record<string, unknown>);
          });
        }
      });

      if (matchedMap.size === 0) {
        try {
          const allSnap = await getDocs(trackerRef);
          const qLower = clean.toLowerCase();
          allSnap.forEach((docSnap) => {
            const d = docSnap.data() as Record<string, unknown>;
            const job = String(d.jobCardNumber || '').toLowerCase();
            const mobDigits = String(d.customerMobile || '').replace(/\D/g, '');
            const matchesJob = job === qLower || (qLower.length >= 3 && job.includes(qLower));
            const matchesMobile =
              last10.length >= 10 && mobDigits.endsWith(last10);
            if (matchesJob || matchesMobile) {
              addSanitizedDoc(docSnap.id, d);
            }
          });
        } catch {
          // Collection-wide list restricted by rules; targeted queries already ran
        }
      }

      setResults(Array.from(matchedMap.values()));
    } catch {
      setErrorMsg('Unable to check repair status right now. Please try again or call the store.');
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery.trim()) {
      setSearchInput(initialQuery);
      void runSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runSearch(searchInput);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-[#0A0F1C] text-white border border-slate-800 rounded-3xl p-6 sm:p-9 shadow-md space-y-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <Wrench className="w-4 h-4" />
            <span>Live Repair Tracker</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Track Your Repair Job
          </h1>
          <p className="text-sm text-slate-300">
            Enter your <strong>Repair Job ID</strong> or <strong>10-digit Mobile Number</strong> to inspect your device&apos;s live stage.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g., JOB-104 or 9876543210"
              aria-label="Repair Job ID or Mobile Number"
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder:text-slate-400 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold whitespace-nowrap transition-colors disabled:opacity-60"
          >
            {searching ? 'Checking...' : 'Track Status'}
          </button>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/30 text-xs font-medium text-red-200">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Results (Strictly Job ID, Device Model, and 4-step Progress Bar ONLY) */}
      {hasSearched && !searching && !errorMsg && (
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
              <Smartphone className="w-10 h-10 text-slate-300 mx-auto" />
              <h2 className="font-display text-base font-bold text-slate-900">
                No Matching Repair Record Found
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Double-check your Job ID or the 10-digit mobile number given at the repair counter, or message us on WhatsApp.
              </p>
            </div>
          ) : (
            results.map((record) => {
              const currentIndex = getStepIndex(record.status);
              return (
                <article
                  key={record.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Job ID:{' '}
                        <span className="font-mono font-bold text-slate-900">
                          {record.jobCardNumber}
                        </span>
                      </p>
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950 mt-0.5">
                        {record.deviceModel}
                      </h2>
                    </div>
                    <span
                      className={`self-start px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                        record.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : record.status === 'DELIVERED'
                          ? 'bg-[#0A0F1C] text-white'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {REPAIR_STEPS[currentIndex]?.label || 'Received'}
                    </span>
                  </div>

                  {/* 4-Step Progress Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-2.5">
                    {REPAIR_STEPS.map((step, idx) => {
                      const isDone = idx <= currentIndex;
                      const isCurrent = idx === currentIndex;
                      return (
                        <div
                          key={step.key}
                          className={`rounded-2xl p-3.5 border transition-colors ${
                            isCurrent
                              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-600/10'
                              : isDone
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-slate-50 border-slate-200 opacity-65'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {step.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 pl-8">
                            {step.subtitle}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
