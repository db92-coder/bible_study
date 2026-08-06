import { useLayoutEffect, useRef, useState } from 'react';
import { usePersonFamily, type PersonSummary } from '../../lib/genealogyApi';

interface Position {
  top: number;
  left: number;
  caretLeft: number;
  above: boolean;
}

const MARGIN = 10;

function RelativeGroup({
  label,
  people,
  onSelect,
}: {
  label: string;
  people: PersonSummary[];
  onSelect: (id: string) => void;
}) {
  if (people.length === 0) return null;
  return (
    <div className="mt-2 first:mt-0">
      <h4 className="text-[0.65rem] font-semibold uppercase tracking-widest text-ink-faint">{label}</h4>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {people.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            title={p.source_ref}
            className="rounded-md border border-parchment-300 bg-white px-2 py-0.5 font-display text-sm text-teal transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-gold-soft"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PersonPopup({
  anchor,
  personId,
  onSelectPerson,
  onClose,
}: {
  anchor: HTMLElement;
  personId: string;
  onSelectPerson: (id: string) => void;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Position | null>(null);
  const family = usePersonFamily(personId);

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
    window.addEventListener('scroll', reposition, { passive: true, capture: true });
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, { capture: true });
      window.removeEventListener('resize', reposition);
    };
    // Re-measure when the family data changes size (loading -> loaded).
  }, [anchor, family.data]);

  if (!pos) return null;

  return (
    <div
      ref={popupRef}
      role="dialog"
      aria-label="Family relationships"
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
      <div className="flex items-center justify-between gap-3 border-b border-parchment-200 px-3 py-1.5 dark:border-parchment-700">
        <span className="font-display text-sm">{family.data?.person.name ?? '…'}</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded p-0.5 text-ink-faint hover:bg-parchment-200 dark:hover:bg-parchment-700"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto p-3">
        {family.isLoading && <p className="text-xs italic text-ink-faint">Looking up family…</p>}
        {family.isError && <p className="text-xs text-ink-faint">Couldn't load this person's family.</p>}
        {family.data && (
          <>
            <RelativeGroup label="Parents" people={family.data.parents} onSelect={onSelectPerson} />
            <RelativeGroup label="Grandparents" people={family.data.grandparents} onSelect={onSelectPerson} />
            <RelativeGroup label="Children" people={family.data.children} onSelect={onSelectPerson} />
            <RelativeGroup label="Grandchildren" people={family.data.grandchildren} onSelect={onSelectPerson} />
            {family.data.parents.length === 0 &&
              family.data.grandparents.length === 0 &&
              family.data.children.length === 0 &&
              family.data.grandchildren.length === 0 && (
                <p className="text-xs text-ink-faint">No recorded relationships for this person yet.</p>
              )}
          </>
        )}
      </div>
    </div>
  );
}
