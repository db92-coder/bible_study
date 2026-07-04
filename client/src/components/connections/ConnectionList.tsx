import { GROUP_COLORS, type Connection } from '../../lib/connectionsApi';

function refLabel(c: Connection) {
  const from = c.ot.refs[0];
  const to = c.nt.refs[0];
  if (!from || !to) return `${c.ot.label} → ${c.nt.label}`;
  return `${from.book} ${from.chapter} → ${to.book} ${to.chapter}`;
}

export function ConnectionList({
  connections,
  selectedId,
  onSelect,
}: {
  connections: Connection[];
  selectedId: string | null;
  onSelect: (c: Connection) => void;
}) {
  if (connections.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-parchment-300 p-8 text-center text-sm text-ink-faint dark:border-parchment-700">
        No connections match — clear the search or pick another category.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {connections.map((c) => {
        const color = GROUP_COLORS[c.group] ?? '#6b6b6b';
        const selected = c.id === selectedId;
        return (
          <li key={c.id}>
            <button
              onClick={() => onSelect(c)}
              className={`w-full rounded-xl border bg-white p-3.5 text-left transition dark:bg-parchment-800 ${
                selected
                  ? 'border-gold'
                  : 'border-parchment-300 hover:border-gold-soft dark:border-parchment-700'
              }`}
              style={{ borderLeftWidth: 4, borderLeftColor: color }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate font-display text-base leading-snug">
                  {c.title}
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-px text-[0.65rem] font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  {c.group}
                </span>
              </div>
              <p className="mt-1 text-xs text-ink-faint">{refLabel(c)}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
