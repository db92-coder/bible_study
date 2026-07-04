import { useMemo, useState } from 'react';
import { BOOKS } from '../../data/books';
import { GROUP_COLORS, type Connection } from '../../lib/connectionsApi';

const W = 1300;
const H = 460;
const AXIS_Y = 400;
const BOOK_W = W / BOOKS.length;

function xFor(book: string, chapter: number): number | null {
  const idx = BOOKS.findIndex((b) => b.name === book);
  if (idx === -1) return null;
  const info = BOOKS[idx];
  const frac = Math.min(1, Math.max(0, (chapter - 0.5) / info.chapters));
  return idx * BOOK_W + frac * BOOK_W;
}

interface Arc {
  conn: Connection;
  x1: number;
  x2: number;
  color: string;
}

export function ArcDiagram({
  connections,
  selectedId,
  onSelect,
}: {
  connections: Connection[];
  selectedId: string | null;
  onSelect: (conn: Connection) => void;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const arcs = useMemo<Arc[]>(() => {
    const out: Arc[] = [];
    for (const c of connections) {
      const from = c.ot.refs[0];
      const to = c.nt.refs[0];
      if (!from || !to) continue;
      const xa = xFor(from.book, from.chapter);
      const xb = xFor(to.book, to.chapter);
      if (xa === null || xb === null) continue;
      out.push({
        conn: c,
        x1: Math.min(xa, xb),
        x2: Math.max(xa, xb),
        color: GROUP_COLORS[c.group] ?? '#6b6b6b',
      });
    }
    // Longer arcs behind shorter ones so short arcs stay hoverable.
    return out.sort((a, b) => b.x2 - b.x1 - (a.x2 - a.x1));
  }, [connections]);

  const activeId = hoverId ?? selectedId;
  const active = arcs.find((a) => a.conn.id === activeId);
  const activeBooks = new Set<string>();
  if (active) {
    for (const r of [...active.conn.ot.refs, ...active.conn.nt.refs]) activeBooks.add(r.book);
  }

  const otWidth = BOOKS.filter((b) => b.testament === 'OT').length * BOOK_W;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full select-none"
      role="img"
      aria-label="Arc diagram of connections between Bible books"
    >
      {/* Testament bands */}
      <rect x={0} y={AXIS_Y} width={otWidth} height={16} rx={3} className="fill-parchment-300 dark:fill-parchment-700" />
      <rect x={otWidth + 2} y={AXIS_Y} width={W - otWidth - 2} height={16} rx={3} className="fill-gold-soft/60 dark:fill-gold/40" />
      <text x={otWidth / 2} y={AXIS_Y + 40} textAnchor="middle" className="fill-ink-faint text-[13px] font-semibold uppercase tracking-widest">
        Old Testament
      </text>
      <text x={otWidth + (W - otWidth) / 2} y={AXIS_Y + 40} textAnchor="middle" className="fill-ink-faint text-[13px] font-semibold uppercase tracking-widest">
        New Testament
      </text>

      {/* Book ticks */}
      {BOOKS.map((b, i) => {
        const isActive = activeBooks.has(b.name);
        return (
          <g key={b.name}>
            <line
              x1={i * BOOK_W}
              y1={AXIS_Y}
              x2={i * BOOK_W}
              y2={AXIS_Y + 16}
              className="stroke-parchment-50 dark:stroke-parchment-900"
              strokeWidth={1}
            />
            {isActive && (
              <>
                <rect x={i * BOOK_W} y={AXIS_Y} width={BOOK_W} height={16} rx={3} fill={active?.color} opacity={0.9} />
                <text
                  x={i * BOOK_W + BOOK_W / 2}
                  y={AXIS_Y - 8}
                  textAnchor="middle"
                  className="fill-current text-[12px] font-semibold"
                  style={{ fill: active?.color }}
                >
                  {b.name}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Arcs */}
      {arcs.map((a) => {
        const isActive = a.conn.id === activeId;
        const dim = activeId !== null && !isActive;
        const rx = Math.max((a.x2 - a.x1) / 2, 6);
        const ry = Math.min(AXIS_Y - 30, rx * 0.75 + 24);
        const d = `M ${a.x1} ${AXIS_Y} A ${rx} ${ry} 0 0 1 ${a.x2} ${AXIS_Y}`;
        return (
          <g key={a.conn.id}>
            <path
              d={d}
              fill="none"
              stroke={a.color}
              strokeWidth={isActive ? 3.5 : 1.8}
              strokeOpacity={dim ? 0.12 : isActive ? 1 : 0.55}
              strokeDasharray={a.conn.kind === 'user' ? '6 4' : undefined}
              strokeLinecap="round"
              className="pointer-events-none transition-[stroke-opacity,stroke-width] duration-150"
            />
            {/* Fat invisible twin: the touch/hover target */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              className="cursor-pointer"
              onMouseEnter={() => setHoverId(a.conn.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onSelect(a.conn)}
            />
          </g>
        );
      })}

      {/* Endpoint dots for the active arc */}
      {active && (
        <>
          <circle cx={active.x1} cy={AXIS_Y} r={5} fill={active.color} />
          <circle cx={active.x2} cy={AXIS_Y} r={5} fill={active.color} />
        </>
      )}
    </svg>
  );
}
