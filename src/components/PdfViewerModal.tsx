import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  AlertTriangle,
  Download,
  ExternalLink,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { resolvePdfPayload } from '../lib/mediaResolver';
import { DownloadItem } from '../types/store';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfViewerModalProps {
  item: DownloadItem | null;
  downloading: boolean;
  onClose: () => void;
  onDownload: (item: DownloadItem) => void;
}

export function PdfViewerModal({
  item,
  downloading,
  onClose,
  onDownload,
}: PdfViewerModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  useEffect(() => {
    if (!item) {
      setPdfDoc(null);
      setNumPages(0);
      setFallbackUrl('');
      setUseIframeFallback(false);
      setErrorMsg(null);
      return;
    }

    let cancelled = false;
    let activeTask: pdfjsLib.PDFDocumentLoadingTask | null = null;
    let loadedProxy: pdfjsLib.PDFDocumentProxy | null = null;

    const loadPdf = async () => {
      setLoading(true);
      setErrorMsg(null);
      setUseIframeFallback(false);
      setNumPages(0);
      setPdfDoc(null);
      setZoom(1);

      try {
        const payload = await resolvePdfPayload(item.fileUrlOrData);
        if (cancelled) return;

        if (!payload.url && !payload.bytes) {
          setErrorMsg('PDF file source is unavailable.');
          setLoading(false);
          return;
        }

        setFallbackUrl(payload.url);

        try {
          activeTask = payload.bytes
            ? pdfjsLib.getDocument({ data: payload.bytes })
            : pdfjsLib.getDocument({ url: payload.url });

          const docProxy = await activeTask.promise;
          if (cancelled) {
            void docProxy.cleanup();
            return;
          }
          loadedProxy = docProxy;
          setPdfDoc(docProxy);
          setNumPages(docProxy.numPages);
          setLoading(false);
        } catch {
          if (cancelled) return;
          // If external HTTPS PDF fails CORS in PDF.js, fall back cleanly to iframe + new tab link
          if (payload.url) {
            setUseIframeFallback(true);
          } else {
            setErrorMsg('Unable to preview this PDF inside the viewer. Please tap Download.');
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setErrorMsg('Unable to load PDF file chunks. Please check your internet or tap Download.');
          setLoading(false);
        }
      }
    };

    void loadPdf();

    return () => {
      cancelled = true;
      if (activeTask) {
        void activeTask.destroy().catch(() => undefined);
      }
      if (loadedProxy) {
        void loadedProxy.cleanup().catch(() => undefined);
      }
    };
  }, [item]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col p-2 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-viewer-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl w-full mx-auto flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-full"
      >
        {/* Top Viewer Controls */}
        <div className="px-3.5 sm:px-6 py-3 bg-[#0A0F1C] text-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="min-w-0 flex-1">
            <h2
              id="pdf-viewer-title"
              className="font-display text-sm sm:text-base font-bold truncate"
            >
              {item.title}
            </h2>
            <p className="text-[11px] text-slate-300 truncate">
              {item.fileName || 'PDF Document'}
              {numPages > 0 ? ` · ${numPages} ${numPages === 1 ? 'Page' : 'Pages'}` : ''}
              {item.fileSizeLabel ? ` · ${item.fileSizeLabel}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {pdfDoc && !useIframeFallback && (
              <div className="hidden sm:flex items-center gap-1 bg-white/10 rounded-xl px-1.5 py-1 mr-1">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                  aria-label="Zoom out PDF"
                  className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 tabular-nums">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
                  aria-label="Zoom in PDF"
                  className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {fallbackUrl && (
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                title="Open PDF in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Open Tab</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => onDownload(item)}
              disabled={downloading}
              className="min-h-[36px] px-3 sm:px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Saving...' : 'Download'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close PDF reader"
              className="min-h-[36px] min-w-[36px] rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Zoom Strip */}
        {pdfDoc && !useIframeFallback && (
          <div className="sm:hidden px-3 py-1.5 bg-slate-900 text-white border-t border-white/10 flex items-center justify-between text-xs shrink-0">
            <span className="text-slate-300 font-medium">
              {numPages} {numPages === 1 ? 'Page' : 'Pages'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                aria-label="Zoom out PDF"
                className="px-2.5 py-1 rounded-lg bg-white/10 font-bold"
              >
                −
              </button>
              <span className="font-mono font-bold tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.2).toFixed(2))))}
                aria-label="Zoom in PDF"
                className="px-2.5 py-1 rounded-lg bg-white/10 font-bold"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* PDF Canvas Scroll Viewport */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto bg-slate-200/80 p-3 sm:p-6 flex flex-col items-center gap-4"
        >
          {loading && (
            <div className="my-auto py-16 flex flex-col items-center justify-center text-slate-600 gap-3">
              <div className="w-10 h-10 rounded-full border-3 border-slate-900 border-t-amber-500 animate-spin" />
              <p className="text-sm font-semibold">Rendering PDF pages...</p>
            </div>
          )}

          {!loading && errorMsg && (
            <div className="my-auto max-w-md bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-xs">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-slate-900">{errorMsg}</p>
              <button
                type="button"
                onClick={() => onDownload(item)}
                className="min-h-[40px] px-5 py-2 rounded-xl bg-[#0A0F1C] text-white text-xs font-bold inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download PDF Directly</span>
              </button>
            </div>
          )}

          {!loading && !errorMsg && useIframeFallback && fallbackUrl && (
            <div className="w-full h-full min-h-[440px] flex flex-col gap-3">
              <iframe
                src={fallbackUrl}
                title={item.title}
                className="w-full flex-1 min-h-[420px] rounded-xl border border-slate-300 bg-white"
              />
              <div className="text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>
                  If preview does not appear on mobile, tap{' '}
                  <a
                    href={fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-700 underline"
                  >
                    Open in New Tab
                  </a>{' '}
                  or Download.
                </span>
              </div>
            </div>
          )}

          {!loading && !errorMsg && !useIframeFallback && pdfDoc && (
            <div className="w-full flex flex-col items-center gap-4">
              {Array.from({ length: numPages }, (_, idx) => (
                <PdfCanvasPage
                  key={idx + 1}
                  pdfDoc={pdfDoc}
                  pageNumber={idx + 1}
                  totalPages={numPages}
                  zoom={zoom}
                  containerRef={scrollContainerRef}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface PdfCanvasPageProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  totalPages: number;
  zoom: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function PdfCanvasPage({
  pdfDoc,
  pageNumber,
  totalPages,
  zoom,
  containerRef,
}: PdfCanvasPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let renderTask: pdfjsLib.RenderTask | null = null;

    const renderPage = async () => {
      setRendering(true);
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const containerWidth = containerRef.current?.clientWidth || 760;
        const targetWidth = Math.max(280, Math.min(containerWidth - 32, 860));
        const fitScale = targetWidth / baseViewport.width;
        const scale = fitScale * zoom;

        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const viewport = page.getViewport({ scale: scale * dpr });

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
        canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

        renderTask = page.render({
          canvasContext: ctx,
          viewport,
          canvas,
        });
        await renderTask.promise;
        if (!cancelled) setRendering(false);
      } catch {
        if (!cancelled) setRendering(false);
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // Ignore cancel errors
        }
      }
    };
  }, [pdfDoc, pageNumber, zoom, containerRef]);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-300/80 overflow-hidden max-w-full">
      <div className="relative flex justify-center bg-white">
        <canvas ref={canvasRef} className="block max-w-full h-auto" />
        {rendering && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-500">
              Loading page {pageNumber}...
            </span>
          </div>
        )}
      </div>
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-[11px] font-mono text-slate-500 text-center tabular-nums">
        Page {pageNumber} of {totalPages}
      </div>
    </div>
  );
}
