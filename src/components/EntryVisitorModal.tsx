import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, Phone, Store, User, X } from 'lucide-react';
import { db, handleFirestoreError, OperationType, STORE_ID, STORE_ROOT_PATH } from '../lib/firebase';
import {
  clampString,
  formatLocalTimeLabel,
  getLocalTodayYYYYMMDD,
} from '../utils/formatters';

interface EntryVisitorModalProps {
  isOpen: boolean;
  shopName: string;
  onClose: () => void;
}

const VISIT_REASONS = [
  'New Mobile',
  'Second Hand Mobile',
  'Mobile Repair',
  'Accessories/Cover',
  'CSC/Banking Service',
  'Sell Old Phone',
  'Other',
] as const;

export function EntryVisitorModal({ isOpen, shopName, onClose }: EntryVisitorModalProps) {
  const [mobile, setMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState<string>('New Mobile');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = clampString(customerName, 100);
    const cleanMobile = clampString(mobile.replace(/\s+/g, ''), 20);
    const cleanAddress = clampString(address, 250);

    if (cleanMobile.length < 6 || cleanMobile.length > 20) {
      setFormError('Please enter a valid mobile number (6–20 characters).');
      return;
    }
    if (cleanName.length < 1) {
      setFormError('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    const leadsPath = `${STORE_ROOT_PATH}/leads`;
    try {
      await addDoc(collection(db, 'public_stores', STORE_ID, 'leads'), {
        leadType: 'ENTRY_GATE',
        customerName: cleanName,
        mobile: cleanMobile,
        address: cleanAddress,
        purpose: clampString(purpose, 120),
        detailsText: clampString(`Website Entry Visitor — Looking for: ${purpose}`, 1000),
        expectedPricePaise: 0,
        photoDataUrl: '',
        status: 'NEW',
        businessDate: getLocalTodayYYYYMMDD(),
        timeLabel: formatLocalTimeLabel(),
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, leadsPath);
      } catch {
        setFormError('Unable to save your check-in right now. You can skip and browse the store.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-modal-title"
    >
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 bg-[#0A0F1C] text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="entry-modal-title" className="font-display text-base font-bold truncate">
                Welcome to {shopName}
              </h2>
              <p className="text-xs text-slate-300 truncate">
                Quick check-in for priority assistance &amp; exclusive offers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <span>Skip / Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold text-slate-900 mb-1">
                Welcome! Check-in Complete
              </h3>
              <p className="text-sm text-slate-600">
                Opening the store catalog for you now...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="entry-mobile" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="entry-mobile"
                      type="tel"
                      required
                      maxLength={20}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="entry-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Customer Name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="entry-name"
                      type="text"
                      required
                      maxLength={100}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="entry-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Address / Area (Optional)
                </label>
                <input
                  id="entry-address"
                  type="text"
                  maxLength={250}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., Kallu Chowk, Hazaribag"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-2">
                  Reason for Visit
                </span>
                <div className="flex flex-wrap gap-2">
                  {VISIT_REASONS.map((reason) => {
                    const active = purpose === reason;
                    return (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setPurpose(reason)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          active
                            ? 'bg-[#0A0F1C] border-[#0A0F1C] text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:w-1/3 h-11 px-4 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Skip / Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="sm:flex-1 h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Continue to Store'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
