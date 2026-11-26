export type CatalogCategory = 'NEW_PHONE' | 'SECOND_HAND' | 'ACCESSORY' | 'COVER';
export type ServiceCategory = 'REPAIR' | 'CSC' | 'BANKING' | 'SIM';
export type RepairStatus = 'RECEIVED' | 'IN_REPAIR' | 'READY' | 'DELIVERED';
export type LeadType = 'ENTRY_GATE' | 'SELL_PHONE';

export type ModuleAboutKey =
  | 'HOME'
  | 'REPAIR'
  | 'ACCESSORIES'
  | 'MOBILE_SALES'
  | 'CSC_BANKING'
  | 'SIM_SERVICES'
  | 'DOWNLOADS'
  | 'CERTIFICATES'
  | 'CONTACT';

export type StoreTab =
  | 'home'
  | 'repair'
  | 'accessories'
  | 'mobiles'
  | 'csc'
  | 'sim'
  | 'downloads'
  | 'certificates'
  | 'tracker';

export type OfferTheme =
  | 'CRIMSON_GOLD'
  | 'SAFFRON_FIRE'
  | 'EMERALD_NEON'
  | 'ROYAL_PURPLE';

export type MobilesSubTab = 'NEW_PHONE' | 'SECOND_HAND' | 'SELL_PHONE';

export interface StoreProfile {
  shopName: string;
  tagline?: string;
  whatsappNumber?: string;
  callNumber?: string;
  address?: string;
  mapLinkUrl?: string;
  shopPhotoUrl?: string;
  ownerPhotoUrl?: string;
  sectionBanners?: Partial<Record<ModuleAboutKey, string>>;
  offerBanner?: string;
  offerStartDate?: string;
  offerEndDate?: string;
  offerBlinkEnabled?: boolean;
  offerBadgeText?: string;
  offerTheme?: OfferTheme;
  isWebsiteLive?: boolean;
  moduleAbouts?: Partial<Record<ModuleAboutKey, string>>;
}

export interface CatalogItem {
  id: string;
  title: string;
  category: CatalogCategory;
  brand?: string;
  ramStorage?: string;
  color?: string;
  condition?: string;
  batteryHealth?: string;
  warrantyLeft?: string;
  designType?: string;
  description?: string;
  sellingPricePaise: number;
  mrpPaise?: number;
  stockCount: number;
  emiAvailable?: boolean;
  imageDataUrl?: string;
  galleryImages?: string[];
  videoUrlOrData?: string;
  isVisibleOnWebsite?: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  operatorName?: string;
  priceLabel?: string;
  feePaise?: number;
  estimatedTime?: string;
  requiredDocuments?: string;
  description?: string;
  imageDataUrl?: string;
  galleryImages?: string[];
  videoUrlOrData?: string;
  isVisibleOnWebsite?: boolean;
}

export interface DownloadItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  fileName?: string;
  fileSizeLabel?: string;
  fileUrlOrData?: string;
  downloadsCount: number;
  isVisibleOnWebsite?: boolean;
}

export interface CertificateItem {
  id: string;
  name: string;
  issuedBy?: string;
  year?: string;
  category?: string;
  imageDataUrl?: string;
  isVisibleOnWebsite?: boolean;
}

/**
 * Strictly privacy-filtered repair status payload for customer display.
 * Never expose customerName, customerMobile, prices, or internal remarks.
 */
export interface PublicRepairResult {
  id: string;
  jobCardNumber: string;
  deviceModel: string;
  status: RepairStatus;
}

export interface LeadSubmissionPayload {
  leadType: LeadType;
  customerName: string;
  mobile: string;
  address: string;
  purpose: string;
  detailsText: string;
  expectedPricePaise: number;
  photoDataUrl: string;
  status: 'NEW';
  businessDate: string;
  timeLabel: string;
  createdAt: unknown;
}

export interface MediaGallerySlide {
  type: 'image' | 'video';
  src: string;
}

export interface MediaGalleryTarget {
  title: string;
  subtitle?: string;
  priceLabel?: string;
  slides: MediaGallerySlide[];
  initialIndex: number;
  whatsappUrl?: string;
  whatsappLabel?: string;
  disabledAction?: boolean;
  disabledLabel?: string;
}
