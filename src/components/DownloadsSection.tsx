import { useMemo, useState } from 'react';
import { doc, increment, updateDoc } from 'firebase/firestore';
import { Download, Eye, FileText, Search } from 'lucide-react';
import { db, handleFirestoreError, OperationType, STORE_ID, STORE_ROOT_PATH } from '../lib/firebase';
import { resolvePdfForViewing } from '../lib/mediaResolver';
import { DownloadItem, StoreProfile } from '../types/store';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { PdfViewerModal } from './PdfViewerModal';
import { ResolvedImage } from './ResolvedMedia';

interface DownloadsSectionProps {
  store: StoreProfile;
  downloads: DownloadItem[];
}

export function DownloadsSection({ store, downloads }: DownloadsSectionProps) {
  const [queryText, setQueryText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewerItem, setViewerItem] = useState<DownloadItem | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    downloads.forEach((d) => {
      if (d.category?.trim()) unique.add(d.category.trim());
    });
    return ['ALL', ...Array.from(unique).sort()];
  }, [downloads]);

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    return downloads.filter((item) => {
      const catOk =
        selectedCategory === 'ALL' ||
        (item.category || '').trim().toLowerCase() === selectedCategory.toLowerCase();
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    });
  }, [downloads, queryText, selectedCategory]);

  const incrementCounter = async (item: DownloadItem) => {
    const docPath = `${STORE_ROOT_PATH}/downloads/${item.id}`;
    try {
      await updateDoc(doc(db, 'public_stores', STORE_ID, 'downloads', item.id), {
        downloadsCount: increment(1),
      });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      } catch {
        // File already downloaded cleanly
      }
    }
  };

  const handleViewPdf = (item: DownloadItem) => {
    if (!item.fileUrlOrData) {
      setStatusNote(`PDF source unavailable for "${item.title}".`);
      return;
    }
    setStatusNote(null);
    setViewerItem(item);
  };

  const handleDownloadClick = async (item: DownloadItem) => {
    if (!item.fileUrlOrData) {
      setStatusNote(`File unavailable for "${item.title}".`);
      return;
    }

    setDownloadingId(item.id);
    setStatusNote(null);

    try {
      const cleanFileName = (item.fileName || `${item.title}.pdf`).replace(
        /[^\w.\-() ]+/g,
        '_'
      );
      const finalFileName = cleanFileName.toLowerCase().endsWith('.pdf')
        ? cleanFileName
        : `${cleanFileName}.pdf`;

      const resolvedUrl = await resolvePdfForViewing(item.fileUrlOrData);
      if (!resolvedUrl) {
        setStatusNote(`Unable to prepare "${item.title}" for download.`);
        return;
      }

      const link = document.createElement('a');
      link.href = resolvedUrl;
      if (resolvedUrl.startsWith('http')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      link.download = finalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      await incrementCounter(item);
    } catch {
      setStatusNote(`Failed to download "${item.title}". Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ModuleAboutBanner
        text={store.moduleAbouts?.DOWNLOADS}
        title="About Official Downloads"
      />

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div
          className={`${
            store.sectionBanners?.DOWNLOADS ? 'lg:col-span-7' : 'lg:col-span-12'
          } p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Digital Document Library
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 mt-0.5">
              Official Forms &amp; PDF Downloads
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Read PDFs directly inside the browser or download verified forms and checklists.
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Filter forms & PDFs..."
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {store.sectionBanners?.DOWNLOADS && (
          <div className="lg:col-span-5 min-h-[160px] sm:min-h-[190px]">
            <ResolvedImage
              src={store.sectionBanners.DOWNLOADS}
              alt="Official Forms and PDF Downloads"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#0A0F1C] border-[#0A0F1C] text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            );
          })}
        </div>
      )}

      {statusNote && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
          {statusNote}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-display text-base font-bold text-slate-900">
            No Downloads Available
          </h2>
          <p className="text-sm text-slate-500">
            Try clearing your search or check back when new PDF forms are published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div className="text-right text-xs text-slate-500 tabular-nums">
                    <span className="font-bold text-slate-900">
                      {(item.downloadsCount || 0).toLocaleString('en-IN')}
                    </span>{' '}
                    downloads
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.category || 'Document'}
                    {item.fileSizeLabel ? ` · ${item.fileSizeLabel}` : ''}
                    {item.fileName ? ` · ${item.fileName}` : ''}
                  </p>
                </div>

                {item.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleViewPdf(item)}
                  disabled={!item.fileUrlOrData}
                  className="min-h-[42px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span>View / Read PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadClick(item)}
                  disabled={downloadingId === item.id || !item.fileUrlOrData}
                  className="min-h-[42px] px-3 py-2 rounded-xl bg-[#0A0F1C] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{downloadingId === item.id ? 'Saving...' : 'Download'}</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reliable Cross-Platform PDF.js Canvas Reader Modal */}
      <PdfViewerModal
        item={viewerItem}
        downloading={Boolean(viewerItem && downloadingId === viewerItem.id)}
        onClose={() => setViewerItem(null)}
        onDownload={handleDownloadClick}
      />
    </div>
  );
}
