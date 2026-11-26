import React, { useState } from 'react';
import { Play, Smartphone } from 'lucide-react';
import { useResolvedMedia } from '../lib/mediaResolver';

interface ResolvedImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  fallbackLabel?: string;
  fallbackSrc?: string;
  draggable?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export function ResolvedImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackIcon,
  fallbackLabel,
  fallbackSrc,
  draggable,
  onContextMenu,
  onDragStart,
}: ResolvedImageProps) {
  const { url, loading, error } = useResolvedMedia(src);
  const [imgError, setImgError] = useState(false);

  const effectiveUrl = !error && !imgError && url ? url : fallbackSrc || '';

  if (loading && !effectiveUrl) {
    return (
      <div className="w-full h-full bg-slate-200/70 animate-pulse flex items-center justify-center">
        <span className="sr-only">Loading image...</span>
      </div>
    );
  }

  if (!effectiveUrl) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200/70 flex flex-col items-center justify-center text-slate-400 gap-2 p-3">
        {fallbackIcon || <Smartphone className="w-9 h-9" />}
        {fallbackLabel && (
          <span className="text-[11px] font-semibold text-slate-500 text-center line-clamp-1">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={effectiveUrl}
      alt={alt}
      referrerPolicy="no-referrer"
      draggable={draggable}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onError={() => setImgError(true)}
      className={className}
    />
  );
}

interface ResolvedVideoProps {
  src: string;
  className?: string;
}

export function ResolvedVideo({ src, className = 'w-full h-full object-contain' }: ResolvedVideoProps) {
  const { url, loading, error } = useResolvedMedia(src);

  if (loading) {
    return (
      <div className="w-full h-full min-h-[240px] bg-slate-900 flex flex-col items-center justify-center text-slate-300 gap-2">
        <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold">Loading product video...</span>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="w-full h-full min-h-[240px] bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
        <Play className="w-10 h-10 text-slate-500" />
        <span className="text-xs font-medium">Unable to load video playback.</span>
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
