import React, { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  BadgeIndianRupee,
  Camera,
  CheckCircle2,
  MessageCircle,
  Smartphone,
  Upload,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType, STORE_ID, STORE_ROOT_PATH } from '../lib/firebase';
import { CatalogItem, MediaGalleryTarget, MobilesSubTab, StoreProfile } from '../types/store';
import {
  buildWhatsAppUrl,
  clampString,
  compressImageToJpegDataUrl,
  formatLocalTimeLabel,
  getLocalTodayYYYYMMDD,
} from '../utils/formatters';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { ProductCard } from './ProductCard';
import { ResolvedImage } from './ResolvedMedia';

interface MobilesSectionProps {
  store: StoreProfile;
  catalog: CatalogItem[];
  subTab: MobilesSubTab;
  onSubTabChange: (sub: MobilesSubTab) => void;
  onSelectProduct: (item: CatalogItem) => void;
  onOpenGallery: (target: MediaGalleryTarget) => void;
}

const SELL_CONDITIONS = ['Like New', 'Good', 'Fair', 'Damaged'] as const;

export function MobilesSection({
  store,
  catalog,
  subTab,
  onSubTabChange,
  onSelectProduct,
  onOpenGallery,
}: MobilesSectionProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');

  const [modelName, setModelName] = useState('');
  const [condition, setCondition] = useState<string>('Good');
  const [expectedPriceRupees, setExpectedPriceRupees] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState('');
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const phonesList = useMemo(() => {
    if (subTab === 'NEW_PHONE') {
      return catalog.filter((item) => item.category === 'NEW_PHONE');
    }
    if (subTab === 'SECOND_HAND') {
      return catalog.filter((item) => item.category === 'SECOND_HAND');
    }
    return [];
  }, [catalog, subTab]);

  const brands = useMemo(() => {
    const unique = new Set<string>();
    phonesList.forEach((p) => {
      if (p.brand?.trim()) unique.add(p.brand.trim());
    });
    return ['ALL', ...Array.from(unique).sort()];
  }, [phonesList]);

  const filteredPhones = useMemo(() => {
    if (selectedBrand === 'ALL') return phonesList;
    return phonesList.filter(
      (p) => (p.brand || '').trim().toLowerCase() === selectedBrand.toLowerCase()
    );
  }, [phonesList, selectedBrand]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);
    setCompressing(true);
    try {
      const { dataUrl, approxBytes } = await compressImageToJpegDataUrl(file, 180 * 1024);
      setPhotoDataUrl(dataUrl);
      setPhotoSizeKb(Math.round(approxBytes / 1024));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to process image.');
      setPhotoDataUrl('');
      setPhotoSizeKb(null);
    } finally {
      setCompressing(false);
    }
  };

  const handleSellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanModel = clampString(modelName, 120);
    const cleanName = clampString(customerName, 100);
    const cleanMobile = clampString(mobile.replace(/\s+/g, ''), 20);
    const cleanAddress = clampString(address, 250);
    const priceNum = Number(expectedPriceRupees || 0);

    if (!cleanModel) {
      setFormError('Please enter your phone model name.');
      return;
    }
    if (cleanMobile.length < 6 || cleanMobile.length > 20) {
      setFormError('Please enter a valid mobile number (6–20 characters).');
      return;
    }
    if (!cleanName) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setFormError('Please enter a valid expected price in Rupees.');
      return;
    }

    const expectedPricePaise = Math.round(priceNum * 100);
    const leadsPath = `${STORE_ROOT_PATH}/leads`;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'public_stores', STORE_ID, 'leads'), {
        leadType: 'SELL_PHONE',
        customerName: cleanName,
        mobile: cleanMobile,
        address: cleanAddress,
        purpose: clampString(`Sell Phone: ${cleanModel}`, 120),
        detailsText: clampString(
          `Model: ${cleanModel} | Condition: ${condition} | Expected Price: ₹${Math.round(
            priceNum
          )}`,
          1000
        ),
        expectedPricePaise,
        photoDataUrl: photoDataUrl || '',
        status: 'NEW',
        businessDate: getLocalTodayYYYYMMDD(),
        timeLabel: formatLocalTimeLabel(),
        createdAt: serverTimestamp(),
      });
      setSubmitSuccess(true);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, leadsPath);
      } catch {
        setFormError('Could not submit your phone quote right now. Please try again or contact via WhatsApp.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetSellForm = () => {
    setModelName('');
    setCondition('Good');
    setExpectedPriceRupees('');
    setCustomerName('');
    setMobile('');
    setAddress('');
    setPhotoDataUrl('');
    setPhotoSizeKb(null);
    setSubmitSuccess(false);
    setFormError(null);
  };

  return (
    <div className="space-y-6">
      <ModuleAboutBanner
        text={store.moduleAbouts?.MOBILE_SALES}
        title="About Mobile Sales & Buyback"
      />

      {/* Flagship Department Banner */}
      <div className="rounded-3xl overflow-hidden bg-[#0A0F1C] text-white border border-slate-800 grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Smartphones &amp; Trade-In Desk
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight">
              New Flagships, Certified Pre-Owned &amp; Phone Buyback
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Compare sealed-box smartphones, inspect verified second-hand battery health &amp; warranty, or submit your device for an instant offer.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-white/10 border border-white/15 self-start overflow-x-auto max-w-full">
            {(
              [
                { id: 'NEW_PHONE', label: 'New Mobile' },
                { id: 'SECOND_HAND', label: 'Second Hand Mobile' },
                { id: 'SELL_PHONE', label: 'Sell Your Phone' },
              ] as const
            ).map((tab) => {
              const active = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    onSubTabChange(tab.id);
                    setSelectedBrand('ALL');
                  }}
                  className={`min-h-[38px] px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[180px] sm:min-h-[220px]">
          <ResolvedImage
            src={
              store.sectionBanners?.MOBILE_SALES ||
              '/src/assets/images/dept_flagship_phones_1795478716255.jpg'
            }
            fallbackSrc="/src/assets/images/dept_flagship_phones_1795478716255.jpg"
            alt="Flagship Smartphones at GP Mobile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0A0F1C] via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* NEW_PHONE / SECOND_HAND Grid */}
      {subTab !== 'SELL_PHONE' ? (
        <div className="space-y-5">
          {brands.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {brands.map((brand) => {
                const active = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => setSelectedBrand(brand)}
                    className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-[#0A0F1C] border-[#0A0F1C] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {brand === 'ALL' ? 'All Brands' : brand}
                  </button>
                );
              })}
            </div>
          )}

          {filteredPhones.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
              <Smartphone className="w-10 h-10 text-slate-300 mx-auto" />
              <h2 className="font-display text-base font-bold text-slate-900">
                No {subTab === 'NEW_PHONE' ? 'New Mobiles' : 'Second Hand Mobiles'} Listed Right Now
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Looking for a specific model? Message us on WhatsApp for today&apos;s showroom stock and best price.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {filteredPhones.map((item) => (
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
      ) : (
        /* SELL YOUR PHONE LEAD FORM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <img
              src="/src/assets/images/banner_sell_phone_1795451564557.jpg"
              alt="Sell Your Used Smartphone at GP Mobile"
              className="w-full aspect-[4/3] object-cover border-b border-slate-100"
            />
            <div className="p-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <BadgeIndianRupee className="w-4 h-4" />
                <span>Fast Trade-In Quote</span>
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Get Top Value for Your Old Phone
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Share your smartphone model, condition, expected price, and a quick photo. Our team evaluates it and calls you back with a same-day cash or upgrade offer.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <p><strong className="text-slate-900">01.</strong> Enter phone model &amp; expected price</p>
                <p><strong className="text-slate-900">02.</strong> Upload an optional photo (auto-compressed)</p>
                <p><strong className="text-slate-900">03.</strong> Receive instant counter valuation call</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
            {submitSuccess ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Sell Request Submitted!
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    We received your valuation request for <strong>{modelName}</strong>. Our store team will contact you at <strong>{mobile}</strong> shortly.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={buildWhatsAppUrl(
                      store.whatsappNumber,
                      `Hello ${
                        store.shopName || 'GP MOBILE & CSC CENTRE'
                      }, I just submitted a Sell Phone request for "${modelName}" (Condition: ${condition}, Expected: ₹${expectedPriceRupees || 0}). My mobile: ${mobile}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Also Ping on WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={resetSellForm}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Submit Another Phone
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSellSubmit} className="space-y-4">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Phone Valuation Details
                </h2>

                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="sell-model" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Model Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="sell-model"
                      type="text"
                      required
                      maxLength={120}
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      placeholder="e.g., iPhone 13 128GB / Redmi Note 12"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  <div>
                    <label htmlFor="sell-price" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Expected Price (₹)
                    </label>
                    <input
                      id="sell-price"
                      type="number"
                      min={0}
                      step={1}
                      value={expectedPriceRupees}
                      onChange={(e) => setExpectedPriceRupees(e.target.value)}
                      placeholder="e.g., 14500"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm tabular-nums focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-700 mb-2">
                    Device Condition
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SELL_CONDITIONS.map((cond) => {
                      const active = condition === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setCondition(cond)}
                          className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            active
                              ? 'bg-[#0A0F1C] border-[#0A0F1C] text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Photo (Optional, auto-compressed &le; 180 KB)
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="min-h-[44px] px-4 py-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center gap-2 cursor-pointer transition-colors">
                      {compressing ? (
                        <span>Compressing photo...</span>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-slate-700" />
                          <span>{photoDataUrl ? 'Change Photo' : 'Upload Phone Photo'}</span>
                          <Upload className="w-3.5 h-3.5 text-slate-400" />
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="sr-only"
                      />
                    </label>

                    {photoDataUrl && (
                      <div className="flex items-center gap-3">
                        <img
                          src={photoDataUrl}
                          alt="Uploaded phone preview"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="text-xs text-slate-600">
                          <p className="font-semibold text-emerald-700">Ready ({photoSizeKb ?? '?'} KB)</p>
                          <button
                            type="button"
                            onClick={() => {
                              setPhotoDataUrl('');
                              setPhotoSizeKb(null);
                            }}
                            className="text-red-600 hover:underline font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label htmlFor="sell-mobile" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mobile Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="sell-mobile"
                      type="tel"
                      required
                      maxLength={20}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>

                  <div>
                    <label htmlFor="sell-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="sell-name"
                      type="text"
                      required
                      maxLength={100}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Full name"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sell-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Address / Locality
                  </label>
                  <input
                    id="sell-address"
                    type="text"
                    maxLength={250}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g., Pugmil Road, Hazaribag"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || compressing}
                  className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors disabled:opacity-60 shadow-xs"
                >
                  {submitting ? 'Submitting Quote Request...' : 'Submit Phone for Valuation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
