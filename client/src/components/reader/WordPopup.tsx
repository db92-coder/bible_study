import { useLayoutEffect, useRef, useState } from 'react';
import type { LexiconWord } from '../../lib/lexiconApi';

interface Position {
  top: number;
  left: number;
  caretLeft: number;
  above: boolean;
}

const MARGIN = 10;

export function WordPopup({
  anchor,
  word,
  onClose,
}: {
  anchor: HTMLElement;
  word: LexiconWord;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Position | null>(null);

  useLayoutEffect(() => {
    function reposition() {
      const rect = anchor.getBoundingClientRect();
      const popupEl = popupRef.current;
      const width = popupEl?.offsetWidth ?? 288;
      const height = popupEl?.offsetHeight ?? 160;

      const idealLeft = rect.left + rect.width / 2 - width / 2;
      const left = Math.min(Math.max(idealLeft, MARGIN), window.innerWidth - width - MARGIN);

      let top = rect.top - height - 10;
      let above = true;
      if (top < MARGIN) {
        top = rect.bottom + 10;
        above = false;
      }
      top = Math.min(top, window.innerHeight - height - MARGIN);

      const caretLeft = Math.min(Math.max(rect.left + rect.width / 2 - left, 14), width - 14);

      setPos({ top, left, caretLeft, above });
    }

    reposition();
    // Capture-phase so this fires for scrolls on any scrollable ancestor
    // (the desktop context aside, or the shared main scroller on mobile),
    // not just window-level scrolling.
    window.addEventListener('scroll', reposition, { passive: true, capture: true });
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, { capture: true });
      window.removeEventListener('resize', reposition);
    };
  }, [anchor]);

  if (!pos) return null;

  const isHebrew = word.language === 'Hebrew';

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-label={`Word study: ${word.lemma ?? word.id}`}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-50 w-72 max-w-[calc(100vw-20px)] rounded-xl border border-parchment-300 bg-white shadow-xl dark:border-parchment-700 dark:bg-parchment-800"
    >
      <span
        aria-hidden
        style={{ left: pos.caretLeft }}
        className={`absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-parchment-300 bg-white dark:border-parchment-700 dark:bg-parchment-800 ${
          pos.above ? 'bottom-[-6px] border-b border-r' : 'top-[-6px] border-l border-t'
        }`}
      />
      <div className="max-h-[70vh] overflow-y-auto p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span
                className={`font-display text-2xl leading-none ${isHebrew ? '[direction:rtl]' : ''}`}
                lang={isHebrew ? 'he' : 'el'}
              >
                {word.lemma}
              </span>
              <span className="text-base italic text-ink-soft dark:text-ink-invert">{word.translit}</span>
            </div>
            {word.pron && <p className="mt-1 text-xs text-ink-faint">pronounced: {word.pron}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded p-0.5 text-ink-faint hover:bg-parchment-200 dark:hover:bg-parchment-700"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <span
          className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
            isHebrew ? 'bg-teal' : 'bg-gold'
          }`}
        >
          {word.id} · {word.language}
        </span>

        {word.gloss && (
          <p className="mt-2 text-xs text-ink-faint">
            Translated <span className="font-medium text-ink-soft dark:text-ink-invert">"{word.gloss}"</span> here
          </p>
        )}

        {word.strongs_def && <p className="mt-3 text-sm leading-relaxed">{word.strongs_def.trim()}</p>}

        {word.kjv_def && (
          <div className="mt-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
              KJV renderings
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft dark:text-ink-invert">
              {word.kjv_def.replace(/^[\s,;×]+|[\s,;.]+$/g, '')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
