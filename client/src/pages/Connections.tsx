import { useMemo, useState } from 'react';
import { TopBar } from '../components/layout/TopBar';
import { ArcDiagram } from '../components/connections/ArcDiagram';
import { ConnectionCard } from '../components/connections/ConnectionCard';
import { NewConnectionForm } from '../components/connections/NewConnectionForm';
import {
  GROUP_COLORS,
  useConnectionMutations,
  useConnections,
  useMyConnections,
  type Connection,
  type UserConnectionInput,
} from '../lib/connectionsApi';

const GROUPS = ['All', 'Prophecy', 'Type & Shadow', 'Covenant', 'Theme', 'Personal'];

export default function Connections() {
  const seeded = useConnections();
  const mine = useMyConnections();
  const { create, remove } = useConnectionMutations();

  const [group, setGroup] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Connection | null>(null);
  const [adding, setAdding] = useState(false);

  const all = useMemo(
    () => [...(seeded.data ?? []), ...(mine.data?.connections ?? [])],
    [seeded.data, mine.data],
  );

  const filtered = useMemo(() => {
    let out = all;
    if (group !== 'All') out = out.filter((c) => c.group === group);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((c) =>
        `${c.title} ${c.description} ${c.category} ${c.ot.label} ${c.nt.label}`
          .toLowerCase()
          .includes(q),
      );
    }
    return out;
  }, [all, group, search]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of all) m.set(c.group, (m.get(c.group) ?? 0) + 1);
    return m;
  }, [all]);

  async function handleCreate(input: UserConnectionInput) {
    const conn = await create.mutateAsync(input);
    setAdding(false);
    setSelected(conn);
  }

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl">Connections</h2>
              <p className="mt-1 text-sm text-ink-faint">
                {all.length} threads binding the Testaments — prophecies, types &amp; shadows,
                covenants, and your own discoveries. Click an arc to explore it.
              </p>
            </div>
            <button
              onClick={() => setAdding(true)}
              className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
            >
              + New connection
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  group === g
                    ? 'border-transparent text-white'
                    : 'border-parchment-300 bg-white text-ink-soft hover:border-gold dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert'
                }`}
                style={group === g ? { backgroundColor: g === 'All' ? '#4a3f33' : GROUP_COLORS[g] } : undefined}
              >
                {g}
                {g !== 'All' && counts.get(g) ? ` · ${counts.get(g)}` : ''}
              </button>
            ))}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search connections…"
              className="ml-auto w-56 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-parchment-300 bg-parchment-50 p-4 dark:border-parchment-700 dark:bg-parchment-800">
            {seeded.isLoading ? (
              <div className="h-64 animate-pulse rounded-xl bg-parchment-200 dark:bg-parchment-700" />
            ) : (
              <ArcDiagram
                connections={filtered}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
              />
            )}
          </div>

          {mine.data?.unavailable && (
            <p className="mt-3 rounded-lg border border-gold-soft bg-gold-soft/15 px-4 py-2 text-sm">
              Personal connections need migration <code>002_user_connections.sql</code> — run it in
              the Supabase SQL editor to enable saving your own arcs.
            </p>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {adding && (
              <NewConnectionForm
                saving={create.isPending}
                onSave={handleCreate}
                onCancel={() => setAdding(false)}
              />
            )}
            {selected && (
              <ConnectionCard
                connection={selected}
                onClose={() => setSelected(null)}
                onDelete={
                  selected.kind === 'user'
                    ? async () => {
                        await remove.mutateAsync(selected.id);
                        setSelected(null);
                      }
                    : undefined
                }
              />
            )}
            {!selected && !adding && (
              <div className="rounded-xl border border-dashed border-parchment-300 p-8 text-center text-sm text-ink-faint dark:border-parchment-700">
                Hover the arcs to trace each thread; click one to read the full connection — the
                verse chips jump straight into the reader.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
