import { useEffect, useState } from 'react';
import { Award, ShieldCheck, X, ZoomIn } from 'lucide-react';
import { CertificateItem, StoreProfile } from '../types/store';
import { ModuleAboutBanner } from './ModuleAboutBanner';
import { ResolvedImage } from './ResolvedMedia';

interface CertificatesSectionProps {
  store: StoreProfile;
  certificates: CertificateItem[];
}

export function CertificatesSection({ store, certificates }: CertificatesSectionProps) {
  const [zoomedCert, setZoomedCert] = useState<CertificateItem | null>(null);

  useEffect(() => {
    if (!zoomedCert) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomedCert(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomedCert]);

  return (
    <div className="space-y-6 select-none">
      <ModuleAboutBanner
        text={store.moduleAbouts?.CERTIFICATES}
        title="About Verified Certificates"
      />

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div
          className={`${
            store.sectionBanners?.CERTIFICATES ? 'lg:col-span-7' : 'lg:col-span-12'
          } p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Verified Credentials
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 mt-0.5">
              Official Store &amp; CSC Certificates
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Verified authorizations and credentials of GP MOBILE &amp; CSC CENTRE (View Only).
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-4 py-2.5 rounded-xl self-start shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Protected View-Only Gallery</span>
          </div>
        </div>

        {store.sectionBanners?.CERTIFICATES && (
          <div className="lg:col-span-5 min-h-[160px] sm:min-h-[190px]">
            <ResolvedImage
              src={store.sectionBanners.CERTIFICATES}
              alt="Official Store and CSC Certificates"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <Award className="w-10 h-10 text-slate-300 mx-auto" />
          <h2 className="font-display text-base font-bold text-slate-900">
            No Certificates Published Yet
          </h2>
          <p className="text-sm text-slate-500">
            Official shop and CSC certifications will appear here once published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <article
              key={cert.id}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              className="certificate-protected group bg-white border border-slate-200 rounded-2xl overflow-hidden select-none shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Museum-Framed View-Only Protected Frame */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setZoomedCert(cert)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setZoomedCert(cert);
                  }
                }}
                onContextMenu={(e) => e.preventDefault()}
                className="relative aspect-[4/3] bg-slate-100 p-3 border-b border-slate-100 overflow-hidden select-none cursor-zoom-in"
              >
                <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-slate-200/80 relative flex items-center justify-center">
                  <ResolvedImage
                    src={cert.imageDataUrl}
                    alt={cert.name}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    fallbackIcon={<Award className="w-10 h-10" />}
                    fallbackLabel="Verified Credential"
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />

                  {/* Repeating Diagonal Semi-Transparent Watermark + Protective Overlay */}
                  <div
                    aria-hidden="true"
                    onContextMenu={(e) => e.preventDefault()}
                    className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden bg-slate-950/[0.03]"
                  >
                    <div className="-rotate-24 flex flex-col gap-6 opacity-45 pointer-events-none select-none text-center">
                      <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-900 bg-white/70 px-3 py-1 rounded">
                        GP MOBILE &amp; CSC CENTRE • VIEW ONLY
                      </span>
                      <span className="text-[11px] font-extrabold tracking-widest uppercase text-slate-900 bg-white/70 px-3 py-1 rounded">
                        GP MOBILE &amp; CSC CENTRE • VIEW ONLY
                      </span>
                    </div>
                  </div>

                  <span className="absolute bottom-2 right-2 z-20 w-8 h-8 rounded-lg bg-slate-950/75 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Metadata Footer (Zero download options) */}
              <div className="p-5 space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                  {cert.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {[cert.issuedBy, cert.year, cert.category]
                    .filter(Boolean)
                    .join(' · ') || 'Authorized Store Certificate · View Only'}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* View-Only Zoom Lightbox Modal */}
      {zoomedCert && (
        <div
          className="certificate-protected fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cert-zoom-title"
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => setZoomedCert(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col"
          >
            <div className="px-5 py-3.5 bg-[#0A0F1C] text-white flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <h2 id="cert-zoom-title" className="font-display text-sm sm:text-base font-bold truncate">
                  {zoomedCert.name}
                </h2>
                <p className="text-[11px] text-slate-300 truncate">
                  {[zoomedCert.issuedBy, zoomedCert.year, 'View Only'].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedCert(null)}
                aria-label="Close certificate preview"
                className="min-h-[38px] min-w-[38px] rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onContextMenu={(e) => e.preventDefault()}
              className="relative flex-1 min-h-[300px] sm:min-h-[460px] bg-slate-100 flex items-center justify-center p-4 overflow-hidden select-none"
            >
              <ResolvedImage
                src={zoomedCert.imageDataUrl}
                alt={zoomedCert.name}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                className="max-w-full max-h-[72vh] object-contain pointer-events-none select-none"
              />

              {/* Repeating Watermark Overlay inside Zoom Lightbox */}
              <div
                aria-hidden="true"
                onContextMenu={(e) => e.preventDefault()}
                className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden bg-slate-950/[0.02]"
              >
                <div className="-rotate-24 flex flex-col gap-10 opacity-45 pointer-events-none select-none text-center">
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-900 bg-white/70 px-4 py-1.5 rounded">
                    GP MOBILE &amp; CSC CENTRE • VIEW ONLY
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-900 bg-white/70 px-4 py-1.5 rounded">
                    GP MOBILE &amp; CSC CENTRE • VIEW ONLY
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold tracking-widest uppercase text-slate-900 bg-white/70 px-4 py-1.5 rounded">
                    GP MOBILE &amp; CSC CENTRE • VIEW ONLY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
