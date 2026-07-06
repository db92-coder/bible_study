import { useNavigate } from 'react-router-dom';
import { GROUP_COLORS, type Connection } from '../../lib/connectionsApi';
import { useReaderStore } from '../../stores/useReaderStore';

export function ConnectionCard({
  connection,
  onClose,
  onDelete,
}: {
  connection: Connection;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const setLocation = useReaderStore((s) => s.setLocation);
  const navigate = useNavigate();
  const color = GROUP_COLORS[connection.group] ?? '#6b6b6b';

  function openRef(book: string, chapter: number) {
    setLocation(book, chapter);
    navigate('/read');
  }

  function addNote() {
    const anchor = connection.ot.refs[0];
    const params = new URLSearchParams({
      new: '1',
      title: `Connection: ${connection.title}`,
    });
    if (anchor) {
      params.set('book', anchor.book);
      params.set('chapter', String(anchor.chapter));
    }
    navigate(`/notes?${params}`);
  }

  return (
    <div className="rounded-xl border border-parchment-300 bg-white p-5 shadow-sm dark:border-parchment-700 dark:bg-parchment-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {connection.group}
            {connection.category !== connection.group ? ` · ${connection.category}` : ''}
          </span>
          <h3 className="mt-2 font-display text-2xl leading-tight">{connection.title}</h3>
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

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
        <span className="font-semibold uppercase tracking-widest text-ink-faint text-xs pt-1">From</span>
        <span className="flex flex-wrap gap-1.5">
          {connection.ot.refs.map((r, i) => (
            <button
              key={i}
              onClick={() => openRef(r.book, r.chapter)}
              className="rounded-md border border-parchment-300 bg-parchment-50 px-2 py-0.5 font-display transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900"
            >
              {r.book} {r.chapter}
            </button>
          ))}
          <span className="self-center text-xs text-ink-faint">({connection.ot.label})</span>
        </span>
        <span className="font-semibold uppercase tracking-widest text-ink-faint text-xs pt-1">To</span>
        <span className="flex flex-wrap gap-1.5">
          {connection.nt.refs.map((r, i) => (
            <button
              key={i}
              onClick={() => openRef(r.book, r.chapter)}
              className="rounded-md border border-parchment-300 bg-parchment-50 px-2 py-0.5 font-display transition hover:border-gold dark:border-parchment-700 dark:bg-parchment-900"
            >
              {r.book} {r.chapter}
            </button>
          ))}
          <span className="self-center text-xs text-ink-faint">({connection.nt.label})</span>
        </span>
      </div>

      {connection.source_text && (
        <blockquote className="mt-4 border-l-2 pl-3 font-display text-sm italic leading-relaxed text-ink-soft dark:text-ink-invert" style={{ borderColor: color }}>
          “{connection.source_text}”
        </blockquote>
      )}

      <p className="mt-4 text-sm leading-relaxed">{connection.description}</p>

      {connection.significance && (
        <div className="mt-4 rounded-lg bg-parchment-100 p-3 dark:bg-parchment-900">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
            {connection.kind === 'prophecy' ? 'Fulfillment' : 'Significance'}
          </h4>
          <p className="mt-1 text-sm leading-relaxed">{connection.significance}</p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={addNote}
          className="rounded-lg bg-teal px-4 py-1.5 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
        >
          Add note
        </button>
        {onDelete && (
          <button onClick={onDelete} className="text-sm text-red-700 hover:underline">
            Delete connection
          </button>
        )}
      </div>
    </div>
  );
}
