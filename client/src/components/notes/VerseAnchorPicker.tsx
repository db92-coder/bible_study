import { BOOKS, findBook } from '../../data/books';

export interface VerseAnchor {
  book: string | null;
  chapter: number | null;
  verse_start: number | null;
  verse_end: number | null;
}

export function VerseAnchorPicker({
  anchor,
  onChange,
}: {
  anchor: VerseAnchor;
  onChange: (anchor: VerseAnchor) => void;
}) {
  const bookInfo = anchor.book ? findBook(anchor.book) : undefined;

  const inputCls =
    'rounded-lg border border-parchment-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={anchor.book ?? ''}
        onChange={(e) =>
          onChange({
            book: e.target.value || null,
            chapter: e.target.value ? 1 : null,
            verse_start: null,
            verse_end: null,
          })
        }
        className={inputCls}
        aria-label="Anchor book"
      >
        <option value="">No verse anchor</option>
        {BOOKS.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name}
          </option>
        ))}
      </select>

      {anchor.book && (
        <>
          <select
            value={anchor.chapter ?? 1}
            onChange={(e) =>
              onChange({ ...anchor, chapter: Number(e.target.value), verse_start: null, verse_end: null })
            }
            className={inputCls}
            aria-label="Anchor chapter"
          >
            {Array.from({ length: bookInfo?.chapters ?? 1 }, (_, i) => i + 1).map((ch) => (
              <option key={ch} value={ch}>
                ch. {ch}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            placeholder="verse"
            value={anchor.verse_start ?? ''}
            onChange={(e) => {
              const v = e.target.value ? Number(e.target.value) : null;
              onChange({
                ...anchor,
                verse_start: v,
                verse_end: anchor.verse_end && v && anchor.verse_end < v ? v : anchor.verse_end,
              });
            }}
            className={`${inputCls} w-20`}
            aria-label="Start verse"
          />
          <span className="text-xs text-ink-faint">to</span>
          <input
            type="number"
            min={anchor.verse_start ?? 1}
            placeholder="verse"
            value={anchor.verse_end ?? ''}
            onChange={(e) =>
              onChange({ ...anchor, verse_end: e.target.value ? Number(e.target.value) : null })
            }
            className={`${inputCls} w-20`}
            aria-label="End verse"
          />
        </>
      )}
    </div>
  );
}
