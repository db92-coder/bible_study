import { useNavigate } from 'react-router-dom';
import { parseOsisRef } from '../../data/books';
import { useReaderStore } from '../../stores/useReaderStore';
import { ERA_COLORS } from './BibleMap';
import type { Place } from '../../pages/Map';

const MAX_REFS = 14;

export function PlaceCard({ place, onClose }: { place: Place; onClose: () => void }) {
  const setLocation = useReaderStore((s) => s.setLocation);
  const navigate = useNavigate();

  const refs = place.verse_refs
    .map((r) => ({ osis: r, parsed: parseOsisRef(r) }))
    .filter((r) => r.parsed !== null);
  const shown = refs.slice(0, MAX_REFS);
  const hidden = refs.length - shown.length;

  function openRef(book: string, chapter: number) {
    setLocation(book, chapter);
    navigate('/read');
  }

  return (
    <div className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-parchment-300 bg-parchment-50/95 p-5 shadow-xl backdrop-blur dark:border-parchment-700 dark:bg-parchment-800/95">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-xl leading-tight">{place.name}</h3>
          {place.modern_name && place.modern_name.toLowerCase() !== place.name.toLowerCase() && (
            <p className="mt-0.5 text-xs text-ink-faint">Modern: {place.modern_name}</p>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-lg p-1 text-ink-faint hover:bg-parchment-200 dark:hover:bg-parchment-700"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <span
        className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: ERA_COLORS[place.era] ?? '#6b6b6b' }}
      >
        {place.era}
      </span>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-ink-invert">
        {place.description}
      </p>

      <div className="mt-4">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
          Mentioned in
        </h4>
        <div className="mt-2 flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {shown.map(({ osis, parsed }) => (
            <button
              key={osis}
              onClick={() => openRef(parsed!.book, parsed!.chapter)}
              title={`Open ${parsed!.label} in the reader`}
              className="rounded-md border border-parchment-300 bg-white px-2 py-0.5 text-xs text-teal transition hover:border-gold hover:bg-parchment-100 dark:border-parchment-700 dark:bg-parchment-900 dark:text-gold-soft dark:hover:bg-parchment-700"
            >
              {parsed!.label}
            </button>
          ))}
          {hidden > 0 && <span className="px-1 py-0.5 text-xs text-ink-faint">+{hidden} more</span>}
        </div>
      </div>
    </div>
  );
}
