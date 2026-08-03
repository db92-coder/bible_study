import { useLayoutEffect, useRef, useState } from 'react';

interface Position {
  top: number;
  left: number;
  caretLeft: number;
  above: boolean;
}

interface CrossRef {
  osis: string;
  label: string;
  book: string;
  chapter: number;
}

interface SelectionPopupProps {
  containerRef: React.RefObject<HTMLElement | null>;
  anchorVerse: number;
  label: string;
  onNote: () => void;
  onGraph: () => void;
  onDevotional: () => void;
  onClear: () => void;
  crossRefs: CrossRef[];
  onSelectRef: (book: string, chapter: number) => void;
}

const MARGIN = 10;

export function SelectionPopup({
  containerRef,
  anchorVerse,
  label,
  onNote,
  onGraph,
  onDevotional,
  onClear,
  crossRefs,
  onSelectRef,
}: SelectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Position | null>(null);

  useLayoutEffect(() => {
    function reposition() {
      const container = containerRef.current;
      const anchorEl = container?.querySelector<HTMLElement>(`[data-verse="${anchorVerse}"]`);
      if (!anchorEl) {
        setPos(null);
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      const popupEl = popupRef.current;
      const width = popupEl?.offsetWidth ?? 280;
      const height = popupEl?.offsetHeight ?? 44;

      const idealLeft = rect.left + rect.width / 2 - width / 2;
      const left = Math.min(Math.max(idealLeft, MARGIN), window.innerWidth - width - MARGIN);

      let top = rect.top - height - 10;
      let above = true;
      if (top < MARGIN) {
        top = rect.bottom + 10;
        above = false;
      }
      top = Math.min(top, window.innerHeight - height - MARGIN);

      // Where the little caret should point, relative to the popup's own left edge.
      const caretLeft = Math.min(
        Math.max(rect.left + rect.width / 2 - left, 14),
        width - 14,
      );

      setPos({ top, left, caretLeft, above });
    }

    reposition();
    const scrollParent = containerRef.current?.closest('main');
    scrollParent?.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition);
    return () => {
      scrollParent?.removeEventListener('scroll', reposition);
      window.removeEventListener('resize', reposition);
    };
  }, [anchorVerse, containerRef, label, crossRefs.length]);

  if (!pos) return null;

  return (
    <div
      ref={popupRef}
      role="menu"
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-50 flex w-72 max-w-[calc(100vw-20px)] flex-col items-stretch rounded-xl border border-parchment-300 bg-white shadow-xl dark:border-parchment-700 dark:bg-parchment-800"
    >
      <span
        aria-hidden
        style={{ left: pos.caretLeft }}
        className={`absolute h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-parchment-300 bg-white dark:border-parchment-700 dark:bg-parchment-800 ${
          pos.above
            ? 'bottom-[-6px] border-b border-r'
            : 'top-[-6px] border-l border-t'
        }`}
      />
      <div className="flex items-center justify-between gap-3 border-b border-parchment-200 px-3 py-1.5 dark:border-parchment-700">
        <span className="font-display text-sm">{label}</span>
        <button
          onClick={onClear}
          aria-label="Clear selection"
          className="rounded p-0.5 text-ink-faint hover:bg-parchment-200 dark:hover:bg-parchment-700"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-0.5 p-1">
        <button
          onClick={onNote}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-parchment-100 dark:text-ink-invert dark:hover:bg-parchment-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Note
        </button>
        <button
          onClick={onGraph}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-parchment-100 dark:text-ink-invert dark:hover:bg-parchment-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="5" cy="6" r="2.3" />
            <circle cx="19" cy="6" r="2.3" />
            <circle cx="12" cy="18" r="2.3" />
            <path d="m6.9 7.3 3.9 8.7M17.1 7.3l-3.9 8.7M7.3 6h9.4" strokeLinecap="round" />
          </svg>
          Graph
        </button>
        <button
          onClick={onDevotional}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-parchment-100 dark:text-ink-invert dark:hover:bg-parchment-700"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Devotional
        </button>
      </div>
      {crossRefs.length > 0 && (
        <div className="border-t border-parchment-200 p-2 dark:border-parchment-700">
          <p className="mb-1.5 px-1 text-[0.65rem] font-semibold uppercase tracking-widest text-ink-faint">
            Scripture connects with this
          </p>
          <div className="flex flex-wrap gap-1.5 px-1 pb-1">
            {crossRefs.map((r) => (
              <button
                key={r.osis}
                onClick={() => onSelectRef(r.book, r.chapter)}
                title={`Read ${r.label}`}
                className="rounded-md border border-parchment-300 bg-white px-2 py-0.5 font-display text-sm text-teal transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-gold-soft"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
