import { noteAnchorLabel, type Note } from '../../lib/notesApi';

export function NoteList({
  notes,
  selectedId,
  onSelect,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelect: (note: Note) => void;
}) {
  if (notes.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-ink-faint">No notes yet.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {notes.map((n) => {
        const anchor = noteAnchorLabel(n);
        return (
          <li key={n.id}>
            <button
              onClick={() => onSelect(n)}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition ${
                selectedId === n.id
                  ? 'border-gold bg-gold-soft/20'
                  : 'border-parchment-300 bg-white hover:border-gold-soft dark:border-parchment-700 dark:bg-parchment-800 dark:hover:border-gold'
              }`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-medium">{n.title || 'Untitled'}</span>
                {anchor && (
                  <span className="shrink-0 rounded bg-parchment-200 px-1.5 py-0.5 text-[0.65rem] font-medium text-ink-soft dark:bg-parchment-700 dark:text-ink-invert">
                    {anchor}
                  </span>
                )}
              </div>
              {n.body_md && (
                <p className="mt-1 line-clamp-2 text-xs text-ink-faint">{n.body_md.slice(0, 160)}</p>
              )}
              {n.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {n.tags.map((t) => (
                    <span key={t} className="rounded-full bg-teal/10 px-2 py-px text-[0.65rem] text-teal dark:bg-gold/15 dark:text-gold-soft">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
