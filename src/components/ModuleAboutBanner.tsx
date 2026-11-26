import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface StructuredAboutBlock {
  type: 'lead' | 'heading' | 'bullet' | 'paragraph';
  text: string;
  label?: string;
}

export function parseStructuredAbout(rawText?: string): StructuredAboutBlock[] {
  const trimmed = (rawText || '').trim();
  if (!trimmed) return [];

  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const blocks: StructuredAboutBlock[] = [];

  lines.forEach((line, idx) => {
    // Lead catchy slogan on first short line
    if (idx === 0 && line.length <= 105 && !/^\d+\./.test(line) && !/^[-•*]/.test(line)) {
      blocks.push({ type: 'lead', text: line });
      return;
    }

    // Bullet points (- ..., • ..., * ...)
    if (/^[-•*]\s+/.test(line)) {
      const clean = line.replace(/^[-•*]\s+/, '').trim();
      const dashSplit = clean.match(/^([^–—:]{2,55})\s*[–—:]\s*(.+)$/);
      if (dashSplit) {
        blocks.push({
          type: 'bullet',
          label: dashSplit[1].trim(),
          text: dashSplit[2].trim(),
        });
      } else {
        blocks.push({ type: 'bullet', text: clean });
      }
      return;
    }

    // Numbered section headings or short title lines (e.g. "1. New Mobile Phone Sale" or "Hamari Mobile Services")
    const isNumberedHeading = /^\d+\.\s+/.test(line) && line.length <= 90;
    const isShortTitle =
      line.length <= 68 &&
      !/[.।!]$/.test(line) &&
      (line.endsWith('?') || line.endsWith(':') || /^[A-Z0-9]/.test(line));

    if (isNumberedHeading || isShortTitle) {
      blocks.push({ type: 'heading', text: line });
      return;
    }

    blocks.push({ type: 'paragraph', text: line });
  });

  return blocks;
}

interface StructuredAboutContentProps {
  text?: string;
  dark?: boolean;
  collapsedBlocksCount?: number;
}

export function StructuredAboutContent({
  text,
  dark = false,
  collapsedBlocksCount = 6,
}: StructuredAboutContentProps) {
  const [expanded, setExpanded] = useState(false);
  const blocks = useMemo(() => parseStructuredAbout(text), [text]);

  if (blocks.length === 0) return null;

  const isLong = blocks.length > collapsedBlocksCount;
  const visibleBlocks =
    isLong && !expanded ? blocks.slice(0, collapsedBlocksCount) : blocks;

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {visibleBlocks.map((block, idx) => {
          if (block.type === 'lead') {
            return (
              <p
                key={idx}
                className={`font-display text-base sm:text-lg font-extrabold tracking-tight leading-snug ${
                  dark ? 'text-amber-300' : 'text-slate-950'
                }`}
              >
                {block.text}
              </p>
            );
          }

          if (block.type === 'heading') {
            return (
              <h3
                key={idx}
                className={`font-display text-sm sm:text-[15px] font-bold pt-2 border-t ${
                  dark
                    ? 'text-white border-white/10'
                    : 'text-slate-900 border-slate-100'
                }`}
              >
                {block.text}
              </h3>
            );
          }

          if (block.type === 'bullet') {
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed pl-1 ${
                  dark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    dark ? 'text-amber-400' : 'text-emerald-600'
                  }`}
                />
                <span>
                  {block.label ? (
                    <>
                      <strong className={dark ? 'text-white' : 'text-slate-900'}>
                        {block.label}:
                      </strong>{' '}
                      {block.text}
                    </>
                  ) : (
                    block.text
                  )}
                </span>
              </div>
            );
          }

          return (
            <p
              key={idx}
              className={`text-xs sm:text-sm leading-relaxed ${
                dark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {block.text}
            </p>
          );
        })}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-colors ${
            dark
              ? 'bg-white/10 hover:bg-white/15 border-white/15 text-amber-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-900 text-white'
          }`}
        >
          <span>
            {expanded
              ? 'Show Less'
              : `Read Complete Guide (${blocks.length - collapsedBlocksCount} more sections)`}
          </span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

interface ModuleAboutBannerProps {
  text?: string;
  title?: string;
  dark?: boolean;
}

export function ModuleAboutBanner({
  text,
  title = 'About This Service',
  dark = false,
}: ModuleAboutBannerProps) {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;

  return (
    <section
      aria-label={title}
      className={`rounded-3xl overflow-hidden border transition-shadow ${
        dark
          ? 'bg-gradient-to-br from-slate-900/95 via-[#0F172A] to-[#1E1B4B]/60 border-white/15 text-slate-200 shadow-lg'
          : 'bg-white border-slate-200/90 text-slate-700 shadow-[0_14px_38px_-18px_rgba(15,23,42,0.12)]'
      }`}
    >
      {/* Flagship Editorial Header Strip */}
      <div
        className={`px-5 py-3.5 sm:px-7 border-b flex flex-wrap items-center justify-between gap-3 ${
          dark
            ? 'bg-white/[0.04] border-white/10'
            : 'bg-gradient-to-r from-[#0A0F1C] via-[#131C31] to-[#1E293B] border-slate-800 text-white'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xs sm:text-sm font-extrabold uppercase tracking-[0.14em] text-amber-400 truncate">
              {title}
            </h2>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Store Guide</span>
        </span>
      </div>

      {/* Structured Rich Editorial Body */}
      <div className="p-5 sm:p-7">
        <StructuredAboutContent text={trimmed} dark={dark} collapsedBlocksCount={6} />
      </div>
    </section>
  );
}
