import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  STORE_ID,
  STORE_ROOT_PATH,
} from '../lib/firebase';
import {
  CatalogCategory,
  CatalogItem,
  CertificateItem,
  DownloadItem,
  ModuleAboutKey,
  ServiceCategory,
  ServiceItem,
  StoreProfile,
} from '../types/store';
import { DEFAULT_STORE_ADDRESS } from '../utils/formatters';

interface UseStoreDataResult {
  store: StoreProfile;
  catalog: CatalogItem[];
  services: ServiceItem[];
  downloads: DownloadItem[];
  certificates: CertificateItem[];
  loading: boolean;
  errorMessage: string | null;
}

const DEFAULT_STORE_PROFILE: StoreProfile = {
  shopName: 'GP MOBILE & CSC CENTRE',
  tagline: 'Smartphones, Precision Repair & Digital Seva Hub',
  address: DEFAULT_STORE_ADDRESS,
  isWebsiteLive: true,
};

function normalizeCatalogCategory(raw: unknown): CatalogCategory {
  const val = String(raw || '').toUpperCase().trim();
  if (val === 'SECOND_HAND') return 'SECOND_HAND';
  if (val === 'ACCESSORY') return 'ACCESSORY';
  if (val === 'COVER') return 'COVER';
  return 'NEW_PHONE';
}

function normalizeServiceCategory(raw: unknown): ServiceCategory {
  const val = String(raw || '').toUpperCase().trim();
  if (val === 'SIM' || val === 'SIM_SERVICES') return 'SIM';
  if (val === 'CSC') return 'CSC';
  if (val === 'BANKING') return 'BANKING';
  return 'REPAIR';
}

function normalizeGalleryImages(rawGallery: unknown, fallbackSingle?: unknown): string[] {
  const list: string[] = [];
  if (Array.isArray(rawGallery)) {
    rawGallery.forEach((entry) => {
      if (typeof entry === 'string' && entry.trim()) {
        list.push(entry.trim());
      }
    });
  }
  if (list.length === 0 && typeof fallbackSingle === 'string' && fallbackSingle.trim()) {
    list.push(fallbackSingle.trim());
  }
  return list.slice(0, 8);
}

const ABOUT_KEY_ALIASES: Record<string, ModuleAboutKey> = {
  HOME: 'HOME',
  REPAIR: 'REPAIR',
  MOBILE_REPAIR: 'REPAIR',
  ACCESSORIES: 'ACCESSORIES',
  ACCESSORY: 'ACCESSORIES',
  MOBILE_SALES: 'MOBILE_SALES',
  MOBILES: 'MOBILE_SALES',
  MOBILE: 'MOBILE_SALES',
  CSC_BANKING: 'CSC_BANKING',
  CSC: 'CSC_BANKING',
  BANKING: 'CSC_BANKING',
  SIM_SERVICES: 'SIM_SERVICES',
  SIM: 'SIM_SERVICES',
  DOWNLOADS: 'DOWNLOADS',
  DOWNLOAD: 'DOWNLOADS',
  CERTIFICATES: 'CERTIFICATES',
  CERTIFICATE: 'CERTIFICATES',
  CONTACT: 'CONTACT',
  FOOTER: 'CONTACT',
};

function normalizeModuleMap(
  raw: unknown
): Partial<Record<ModuleAboutKey, string>> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  const result: Partial<Record<ModuleAboutKey, string>> = {};
  Object.entries(obj).forEach(([rawKey, val]) => {
    const mappedKey = ABOUT_KEY_ALIASES[rawKey.toUpperCase().trim()];
    if (mappedKey && typeof val === 'string' && val.trim() && !result[mappedKey]) {
      result[mappedKey] = val.trim();
    }
  });
  return result;
}

function normalizeOfferTheme(raw: unknown): StoreProfile['offerTheme'] {
  const val = String(raw || '').toUpperCase().trim();
  if (
    val === 'CRIMSON_GOLD' ||
    val === 'SAFFRON_FIRE' ||
    val === 'EMERALD_NEON' ||
    val === 'ROYAL_PURPLE'
  ) {
    return val;
  }
  return 'CRIMSON_GOLD';
}

export function useStoreData(): UseStoreDataResult {
  const [store, setStore] = useState<StoreProfile>(DEFAULT_STORE_PROFILE);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [storeLoaded, setStoreLoaded] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const storeRef = doc(db, 'public_stores', STORE_ID);
    const unsubStore = onSnapshot(
      storeRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Record<string, unknown>;
          setStore({
            shopName: String(data.shopName || DEFAULT_STORE_PROFILE.shopName),
            tagline: String(data.tagline || DEFAULT_STORE_PROFILE.tagline),
            whatsappNumber: String(data.whatsappNumber || data.callNumber || ''),
            callNumber: String(data.callNumber || data.whatsappNumber || ''),
            address: String(data.address || DEFAULT_STORE_ADDRESS),
            mapLinkUrl: data.mapLinkUrl ? String(data.mapLinkUrl) : '',
            shopPhotoUrl: data.shopPhotoUrl ? String(data.shopPhotoUrl).trim() : '',
            ownerPhotoUrl: data.ownerPhotoUrl ? String(data.ownerPhotoUrl).trim() : '',
            sectionBanners: normalizeModuleMap(
              data.sectionBanners ?? data.section_banners
            ),
            offerBanner: data.offerBanner ? String(data.offerBanner) : '',
            offerStartDate: data.offerStartDate ? String(data.offerStartDate) : '',
            offerEndDate: data.offerEndDate ? String(data.offerEndDate) : '',
            offerBlinkEnabled: data.offerBlinkEnabled !== false,
            offerBadgeText: data.offerBadgeText
              ? String(data.offerBadgeText).trim()
              : '🔥 TODAY SPECIAL OFFER',
            offerTheme: normalizeOfferTheme(data.offerTheme),
            isWebsiteLive: data.isWebsiteLive !== false,
            moduleAbouts: normalizeModuleMap(
              data.moduleAbouts ?? data.module_abouts ?? data.abouts
            ),
          });
        } else {
          setStore(DEFAULT_STORE_PROFILE);
        }
        setStoreLoaded(true);
      },
      (error) => {
        setStoreLoaded(true);
        try {
          handleFirestoreError(error, OperationType.GET, STORE_ROOT_PATH);
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : 'Unable to load store profile.');
        }
      }
    );

    const catalogPath = `${STORE_ROOT_PATH}/catalog`;
    const catalogQuery = query(
      collection(db, 'public_stores', STORE_ID, 'catalog'),
      where('isVisibleOnWebsite', '==', true)
    );
    const unsubCatalog = onSnapshot(
      catalogQuery,
      (snap) => {
        const items: CatalogItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.isVisibleOnWebsite === true) {
            const galleryImages = normalizeGalleryImages(d.galleryImages, d.imageDataUrl);
            items.push({
              id: docSnap.id,
              title: String(d.title || 'Untitled Product'),
              category: normalizeCatalogCategory(d.category),
              brand: d.brand ? String(d.brand) : undefined,
              ramStorage: d.ramStorage ? String(d.ramStorage) : undefined,
              color: d.color ? String(d.color) : undefined,
              condition: d.condition ? String(d.condition) : undefined,
              batteryHealth: d.batteryHealth ? String(d.batteryHealth) : undefined,
              warrantyLeft: d.warrantyLeft ? String(d.warrantyLeft) : undefined,
              designType: d.designType ? String(d.designType) : undefined,
              description: d.description ? String(d.description) : undefined,
              sellingPricePaise: Number(d.sellingPricePaise || 0),
              mrpPaise: d.mrpPaise !== undefined ? Number(d.mrpPaise) : undefined,
              stockCount: Number(d.stockCount ?? 0),
              emiAvailable: Boolean(d.emiAvailable),
              imageDataUrl: d.imageDataUrl ? String(d.imageDataUrl) : galleryImages[0],
              galleryImages,
              videoUrlOrData: d.videoUrlOrData ? String(d.videoUrlOrData).trim() : undefined,
              isVisibleOnWebsite: true,
            });
          }
        });
        setCatalog(items);
        setCatalogLoaded(true);
      },
      (error) => {
        setCatalogLoaded(true);
        try {
          handleFirestoreError(error, OperationType.LIST, catalogPath);
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : 'Unable to load product catalog.');
        }
      }
    );

    const servicesPath = `${STORE_ROOT_PATH}/services`;
    const servicesQuery = query(
      collection(db, 'public_stores', STORE_ID, 'services'),
      where('isVisibleOnWebsite', '==', true)
    );
    const unsubServices = onSnapshot(
      servicesQuery,
      (snap) => {
        const items: ServiceItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.isVisibleOnWebsite === true) {
            const galleryImages = normalizeGalleryImages(d.galleryImages, d.imageDataUrl);
            items.push({
              id: docSnap.id,
              name: String(d.name || 'Service'),
              category: normalizeServiceCategory(d.category),
              operatorName: d.operatorName ? String(d.operatorName) : undefined,
              priceLabel: d.priceLabel ? String(d.priceLabel) : undefined,
              feePaise: d.feePaise !== undefined ? Number(d.feePaise) : undefined,
              estimatedTime: d.estimatedTime ? String(d.estimatedTime) : undefined,
              requiredDocuments: d.requiredDocuments ? String(d.requiredDocuments) : undefined,
              description: d.description ? String(d.description) : undefined,
              imageDataUrl: d.imageDataUrl ? String(d.imageDataUrl) : galleryImages[0],
              galleryImages,
              videoUrlOrData: d.videoUrlOrData ? String(d.videoUrlOrData).trim() : undefined,
              isVisibleOnWebsite: true,
            });
          }
        });
        setServices(items);
        setServicesLoaded(true);
      },
      (error) => {
        setServicesLoaded(true);
        try {
          handleFirestoreError(error, OperationType.LIST, servicesPath);
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : 'Unable to load services.');
        }
      }
    );

    const downloadsPath = `${STORE_ROOT_PATH}/downloads`;
    const downloadsQuery = query(
      collection(db, 'public_stores', STORE_ID, 'downloads'),
      where('isVisibleOnWebsite', '==', true)
    );
    const unsubDownloads = onSnapshot(
      downloadsQuery,
      (snap) => {
        const items: DownloadItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.isVisibleOnWebsite === true) {
            items.push({
              id: docSnap.id,
              title: String(d.title || 'Document'),
              description: d.description ? String(d.description) : undefined,
              category: d.category ? String(d.category) : 'General',
              fileName: d.fileName ? String(d.fileName) : undefined,
              fileSizeLabel: d.fileSizeLabel ? String(d.fileSizeLabel) : undefined,
              fileUrlOrData: d.fileUrlOrData ? String(d.fileUrlOrData) : undefined,
              downloadsCount: Number(d.downloadsCount || 0),
              isVisibleOnWebsite: true,
            });
          }
        });
        setDownloads(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, downloadsPath);
        } catch {
          // Keep remaining storefront active if downloads subcollection is restricted
        }
      }
    );

    const certsPath = `${STORE_ROOT_PATH}/certificates`;
    const certsQuery = query(
      collection(db, 'public_stores', STORE_ID, 'certificates'),
      where('isVisibleOnWebsite', '==', true)
    );
    const unsubCertificates = onSnapshot(
      certsQuery,
      (snap) => {
        const items: CertificateItem[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.isVisibleOnWebsite === true) {
            items.push({
              id: docSnap.id,
              name: String(d.name || 'Verified Certificate'),
              issuedBy: d.issuedBy ? String(d.issuedBy) : undefined,
              year: d.year ? String(d.year) : undefined,
              category: d.category ? String(d.category) : undefined,
              imageDataUrl: d.imageDataUrl ? String(d.imageDataUrl) : undefined,
              isVisibleOnWebsite: true,
            });
          }
        });
        setCertificates(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, certsPath);
        } catch {
          // Keep remaining storefront active if certificates subcollection is restricted
        }
      }
    );

    return () => {
      unsubStore();
      unsubCatalog();
      unsubServices();
      unsubDownloads();
      unsubCertificates();
    };
  }, []);

  return {
    store,
    catalog,
    services,
    downloads,
    certificates,
    loading: !(storeLoaded && catalogLoaded && servicesLoaded),
    errorMessage,
  };
}
