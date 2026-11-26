import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db, STORE_ID } from './firebase';

const resolvedUrlCache = new Map<string, string>();
const resolvedBytesCache = new Map<string, { bytes: Uint8Array; mimeType: string }>();
const inFlightCache = new Map<string, Promise<string>>();
const inFlightBytesCache = new Map<string, Promise<{ bytes: Uint8Array; mimeType: string }>>();

function base64ToUint8Array(base64Raw: string): Uint8Array {
  const cleaned = base64Raw.includes(',')
    ? base64Raw.split(',')[1] || ''
    : base64Raw;
  let normalized = cleaned
    .replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const mod = normalized.length % 4;
  if (mod === 2) normalized += '==';
  else if (mod === 3) normalized += '=';

  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function isChunkedRef(ref?: string | null): boolean {
  return Boolean(ref && ref.trim().startsWith('chunked://'));
}

async function loadChunkedBytes(
  ref: string,
  fallbackMimeType = 'application/octet-stream'
): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const cached = resolvedBytesCache.get(ref);
  if (cached) return cached;

  const existing = inFlightBytesCache.get(ref);
  if (existing) return existing;

  const promise = (async () => {
    const mediaId = ref.replace('chunked://', '').trim();
    if (!mediaId) {
      throw new Error('Invalid chunked media reference.');
    }

    const mediaDocRef = doc(db, 'public_stores', STORE_ID, 'media', mediaId);
    const mediaSnap = await getDoc(mediaDocRef);
    const mediaMeta = mediaSnap.exists() ? mediaSnap.data() : {};
    const rawMime = String(mediaMeta?.mimeType || '').trim();
    const mimeType =
      rawMime && rawMime !== 'application/octet-stream' ? rawMime : fallbackMimeType;

    const chunksQuery = query(
      collection(db, 'public_stores', STORE_ID, 'media', mediaId, 'chunks'),
      orderBy('index', 'asc')
    );
    const chunksSnap = await getDocs(chunksQuery);

    if (chunksSnap.empty) {
      throw new Error(`No media chunks found for ${mediaId}`);
    }

    const arrays: Uint8Array[] = [];
    let totalLength = 0;
    chunksSnap.forEach((chunkDoc) => {
      const dataStr = String(chunkDoc.data()?.data || '');
      if (dataStr) {
        const arr = base64ToUint8Array(dataStr);
        arrays.push(arr);
        totalLength += arr.byteLength;
      }
    });

    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      merged.set(arr, offset);
      offset += arr.byteLength;
    }

    const result = { bytes: merged, mimeType };
    resolvedBytesCache.set(ref, result);
    return result;
  })().finally(() => {
    inFlightBytesCache.delete(ref);
  });

  inFlightBytesCache.set(ref, promise);
  return promise;
}

/**
 * Resolves any media reference (`https://`, `data:...`, local `/src/...`, or `chunked://med_...`).
 * For `chunked://`, fetches metadata from `public_stores/gp_mobile_csc/media/{mediaId}`
 * and ordered chunks from `chunks`, merges into a Blob URL, and caches in memory.
 */
export async function resolveMediaRef(ref?: string | null): Promise<string> {
  const trimmed = (ref || '').trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('chunked://')) {
    return trimmed;
  }

  const cached = resolvedUrlCache.get(trimmed);
  if (cached) return cached;

  const existingPromise = inFlightCache.get(trimmed);
  if (existingPromise) return existingPromise;

  const loadPromise = (async () => {
    const { bytes, mimeType } = await loadChunkedBytes(trimmed);
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    resolvedUrlCache.set(trimmed, objectUrl);
    return objectUrl;
  })().finally(() => {
    inFlightCache.delete(trimmed);
  });

  inFlightCache.set(trimmed, loadPromise);
  return loadPromise;
}

export interface ResolvedPdfPayload {
  /** Fresh copy of PDF bytes when decoded locally (safe to pass to PDF.js worker). */
  bytes?: Uint8Array;
  /** Object URL or HTTPS URL for download / browser fallback. */
  url: string;
}

/**
 * Resolves a PDF reference (`chunked://`, `data:...;base64,...`, or `https://`)
 * returning both raw Uint8Array bytes (for reliable PDF.js canvas rendering on mobile/iframes)
 * and a Blob/HTTPS URL for downloading.
 */
export async function resolvePdfPayload(
  fileUrlOrData?: string | null
): Promise<ResolvedPdfPayload> {
  const trimmed = (fileUrlOrData || '').trim();
  if (!trimmed) {
    return { url: '' };
  }

  if (trimmed.startsWith('chunked://')) {
    const { bytes, mimeType } = await loadChunkedBytes(trimmed, 'application/pdf');
    const resolvedMime =
      mimeType === 'application/octet-stream' ? 'application/pdf' : mimeType;
    let blobUrl = resolvedUrlCache.get(trimmed);
    if (!blobUrl) {
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: resolvedMime });
      blobUrl = URL.createObjectURL(blob);
      resolvedUrlCache.set(trimmed, blobUrl);
    }
    return {
      bytes: new Uint8Array(bytes),
      url: blobUrl,
    };
  }

  if (trimmed.startsWith('data:')) {
    const cacheKey = `pdf_blob::${trimmed.slice(0, 64)}::${trimmed.length}`;
    const [header, base64] = trimmed.split(',');
    const mimeMatch = header.match(/data:([^;]+)/);
    const rawMime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const mimeType =
      rawMime === 'application/octet-stream' ? 'application/pdf' : rawMime;
    const bytes = base64ToUint8Array(base64 || '');

    let blobUrl = resolvedUrlCache.get(cacheKey);
    if (!blobUrl) {
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
      blobUrl = URL.createObjectURL(blob);
      resolvedUrlCache.set(cacheKey, blobUrl);
    }

    return {
      bytes,
      url: blobUrl,
    };
  }

  return { url: trimmed };
}

/**
 * Converts a `data:...;base64,...` PDF URL to a Blob URL,
 * or resolves `chunked://med_...` / returns HTTPS URL directly.
 */
export async function resolvePdfForViewing(fileUrlOrData?: string | null): Promise<string> {
  const payload = await resolvePdfPayload(fileUrlOrData);
  return payload.url;
}

export function useResolvedMedia(ref?: string | null): {
  url: string;
  loading: boolean;
  error: boolean;
} {
  const trimmed = (ref || '').trim();
  const [url, setUrl] = useState<string>(() => {
    if (!trimmed) return '';
    if (!trimmed.startsWith('chunked://')) return trimmed;
    return resolvedUrlCache.get(trimmed) || '';
  });
  const [loading, setLoading] = useState<boolean>(
    Boolean(trimmed.startsWith('chunked://') && !resolvedUrlCache.get(trimmed))
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);

    if (!trimmed) {
      setUrl('');
      setLoading(false);
      return;
    }

    if (!trimmed.startsWith('chunked://')) {
      setUrl(trimmed);
      setLoading(false);
      return;
    }

    const cached = resolvedUrlCache.get(trimmed);
    if (cached) {
      setUrl(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    resolveMediaRef(trimmed)
      .then((resolved) => {
        if (!cancelled) {
          setUrl(resolved);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  return { url, loading, error };
}
