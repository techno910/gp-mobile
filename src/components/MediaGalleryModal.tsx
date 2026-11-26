import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Play, X } from 'lucide-react';
import { MediaGalleryTarget } from '../types/store';
import { ResolvedImage, ResolvedVideo } from './ResolvedMedia';

interface MediaGalleryModalProps {
  target: MediaGalleryTarget | null;
  onClose: () => void;
}

export function MediaGalleryModal({ target, onClose }: MediaGalleryModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (target) {
      setActiveIndex(
        Math.min(Math.max(0, target.initialIndex), Math.max(0, target.slides.length - 1))
      );
    }
  }, [target]);

  useEffect(() => {
    if (!target) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % target.slides.length);
      }
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + target.slides.length) % target.slides.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [target, onClose]);

  if (!target || target.slides.length === 0) return null;

  const currentSlide = target.slides[activeIndex] || target.slides[0];
  const total = target.slides.length;

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || total <= 1) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > 45) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="min-w-0">
            <h2
              id="gallery-modal-title"
              className="font-display text-sm sm:text-base font-bold text-slate-950 truncate"
            >
              {target.title}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {target.subtitle
                ? `${target.subtitle} · `
                : ''}
              Slide {activeIndex + 1} of {total}
              {currentSlide.type === 'video' ? ' (Product Video)' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media gallery"
            className="min-h-[38px] min-w-[38px] rounded-xl hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Swipeable Stage */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative bg-slate-950 flex-1 min-h-[280px] sm:min-h-[420px] max-h-[60vh] flex items-center justify-center overflow-hidden"
        >
          {currentSlide.type === 'video' ? (
            <ResolvedVideo
              src={currentSlide.src}
              className="w-full h-full max-h-[60vh] object-contain"
            />
          ) : (
            <ResolvedImage
              src={currentSlide.src}
              alt={`${target.title} view ${activeIndex + 1}`}
              className="w-full h-full max-h-[60vh] object-contain"
            />
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-transform active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow-md flex items-center justify-center transition-transform active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnails */}
        {total > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5 overflow-x-auto no-scrollbar shrink-0">
            {target.slides.map((slide, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={`${slide.type}-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={
                    slide.type === 'video'
                      ? 'Play product video'
                      : `View image ${idx + 1}`
                  }
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/25 scale-105'
                      : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  {slide.type === 'video' ? (
                    <div className="w-full h-full bg-slate-900 text-white flex flex-col items-center justify-center gap-0.5">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        Video
                      </span>
                    </div>
                  ) : (
                    <ResolvedImage
                      src={slide.src}
                      alt={`${target.title} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Footer Action Bar */}
        {(target.priceLabel || target.whatsappUrl || target.disabledAction) && (
          <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <div>
              {target.priceLabel && (
                <p className="font-display text-lg sm:text-xl font-extrabold text-slate-950 tabular-nums">
                  {target.priceLabel}
                </p>
              )}
            </div>
            {target.disabledAction ? (
              <button
                type="button"
                disabled
                className="min-h-[42px] px-5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
              >
                {target.disabledLabel || 'Out of Stock / Unavailable'}
              </button>
            ) : target.whatsappUrl ? (
              <a
                href={target.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#0A0F1C] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>{target.whatsappLabel || 'Enquire on WhatsApp'}</span>
              </a>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
