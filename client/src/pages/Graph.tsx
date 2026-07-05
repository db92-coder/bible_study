import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { KnowledgeGraph, type RuntimeNode } from '../components/graph/KnowledgeGraph';
import { NodeEditor } from '../components/graph/NodeEditor';
import { findBook } from '../data/books';
import { useElementSize } from '../hooks/useElementSize';
import {
  createEdge,
  createNode,
  deleteEdge,
  deleteNode,
  fetchGraph,
  TYPE_COLORS,
  updateEdge,
  updateNode,
  updateNodePosition,
  type GraphEdge,
  type GraphNode,
  type NodeInput,
  type NodeType,
} from '../lib/graphApi';
import { useReaderStore } from '../stores/useReaderStore';
import { useThemeStore } from '../stores/useThemeStore';

const ALL_TYPES: NodeType[] = ['idea', 'theme', 'person', 'place', 'verse'];

// Distinct muted colors for connected clusters (largest cluster gets the first).
const CLUSTER_PALETTE = [
  '#b48a3c', '#2f6f6a', '#7a4a8b', '#8b3a3a', '#4a6fa5', '#5a8a4a',
  '#b46a8b', '#8a6f3c', '#3c8a8a', '#a0522d', '#6b5aa5', '#4a8a6f',
];

/** Union-find over edges: every connected cluster gets one color. */
function computeClusterColors(nodes: GraphNode[], edges: GraphEdge[]): Map<string, string> {
  const parent = new Map<string, string>();
  const find = (a: string): string => {
    let root = a;
    while (parent.get(root) !== root) root = parent.get(root)!;
    let cur = a;
    while (cur !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  for (const n of nodes) parent.set(n.id, n.id);
  for (const e of edges) {
    if (!parent.has(e.source_id) || !parent.has(e.target_id)) continue;
    parent.set(find(e.source_id), find(e.target_id));
  }
  const clusters = new Map<string, string[]>();
  for (const n of nodes) {
    const root = find(n.id);
    const members = clusters.get(root);
    if (members) members.push(n.id);
    else clusters.set(root, [n.id]);
  }
  // Assign palette colors to clusters, biggest first; sort by root id as a
  // tiebreaker so colors stay stable across renders.
  const ordered = [...clusters.entries()].sort(
    (a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1),
  );
  const colors = new Map<string, string>();
  ordered.forEach(([, members], i) => {
    const color = CLUSTER_PALETTE[i % CLUSTER_PALETTE.length];
    for (const id of members) colors.set(id, color);
  });
  return colors;
}

function parseVerseRef(ref: string): { book: string; chapter: number } | null {
  const m = ref.trim().match(/^((?:[123] )?[A-Za-z ]+?)\s+(\d+)/);
  if (!m) return null;
  const book = findBook(m[1].trim());
  if (!book) return null;
  return { book: book.name, chapter: Math.min(Number(m[2]), book.chapters) };
}

export default function Graph() {
  const dark = useThemeStore((s) => s.dark);
  const setLocation = useReaderStore((s) => s.setLocation);
  const navigate = useNavigate();
  const { ref: canvasBox, width, height } = useElementSize<HTMLDivElement>();
  const searchRef = useRef<HTMLInputElement>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<NodeType>>(new Set());
  const [search, setSearch] = useState('');
  const [colorMode, setColorMode] = useState<'type' | 'cluster'>(
    () => (localStorage.getItem('scribe-graph-colors') as 'type' | 'cluster') ?? 'type',
  );
  const [nodeScale, setNodeScale] = useState(() => {
    const saved = Number(localStorage.getItem('scribe-graph-size'));
    return Number.isFinite(saved) && saved >= 0.35 && saved <= 1.4 ? saved : 0.7;
  });

  function changeNodeScale(value: number) {
    setNodeScale(value);
    localStorage.setItem('scribe-graph-size', String(value));
  }

  const clusterColors = useMemo(() => computeClusterColors(nodes, edges), [nodes, edges]);

  function switchColorMode(mode: 'type' | 'cluster') {
    setColorMode(mode);
    localStorage.setItem('scribe-graph-colors', mode);
  }

  const handlePinNode = useCallback((id: string, x: number, y: number) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x, y } : n)));
    updateNodePosition(id, x, y).catch(() => {
      /* best-effort; position still holds for this session */
    });
  }, []);

  const handleReleasePosition = useCallback(async (id: string) => {
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x: null, y: null } : n)));
    updateNodePosition(id, null, null).catch(() => {});
  }, []);

  useEffect(() => {
    fetchGraph()
      .then(({ nodes, edges }) => {
        setNodes(nodes);
        setEdges(edges);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load graph'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNewNode = useCallback(async () => {
    const node = await createNode({
      label: 'New idea',
      type: 'idea',
      body_md: '',
      verse_ref: null,
      color: TYPE_COLORS.idea,
    });
    setNodes((ns) => [...ns, node]);
    setSelectedId(node.id);
  }, []);

  const handleSave = useCallback(async (id: string, input: NodeInput) => {
    const node = await updateNode(id, input);
    setNodes((ns) => ns.map((n) => (n.id === id ? node : n)));
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    await deleteNode(id);
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source_id !== id && e.target_id !== id));
    setSelectedId(null);
  }, []);

  const handleLink = useCallback(
    async (sourceId: string, targetId: string) => {
      const exists = edges.some(
        (e) =>
          (e.source_id === sourceId && e.target_id === targetId) ||
          (e.source_id === targetId && e.target_id === sourceId),
      );
      if (exists) return;
      const edge = await createEdge(sourceId, targetId);
      setEdges((es) => [...es, edge]);
    },
    [edges],
  );

  const handleEdgeLabel = useCallback(async (edgeId: string, label: string | null) => {
    const edge = await updateEdge(edgeId, label);
    setEdges((es) => es.map((e) => (e.id === edgeId ? edge : e)));
  }, []);

  const handleEdgeDelete = useCallback(async (edgeId: string) => {
    await deleteEdge(edgeId);
    setEdges((es) => es.filter((e) => e.id !== edgeId));
  }, []);

  const openVerse = useCallback(
    (verseRef: string) => {
      const parsed = parseVerseRef(verseRef);
      if (!parsed) return;
      setLocation(parsed.book, parsed.chapter);
      navigate('/');
    },
    [setLocation, navigate],
  );

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col dark:bg-parchment-900">
      <TopBar onToggleSidebar={() => {}} />

      <div className="flex flex-wrap items-center gap-2 border-b border-parchment-300 bg-parchment-50 px-4 py-2 dark:border-parchment-700 dark:bg-parchment-800">
        <button
          onClick={handleNewNode}
          className="rounded-lg bg-teal px-3 py-1.5 text-sm font-medium text-white transition hover:bg-teal-deep dark:bg-gold dark:text-parchment-900"
        >
          + New node
        </button>
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search nodes… ( / )"
          className="w-40 rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold sm:w-56 dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert"
        />
        <div className="ml-2 flex items-center gap-1.5">
          {ALL_TYPES.map((t) => {
            const hidden = hiddenTypes.has(t);
            return (
              <button
                key={t}
                onClick={() =>
                  setHiddenTypes((prev) => {
                    const next = new Set(prev);
                    if (next.has(t)) next.delete(t);
                    else next.add(t);
                    return next;
                  })
                }
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  hidden
                    ? 'border-parchment-300 text-ink-faint opacity-50 dark:border-parchment-700'
                    : 'border-parchment-300 bg-white text-ink-soft dark:border-parchment-700 dark:bg-parchment-800 dark:text-ink-invert'
                }`}
                title={hidden ? `Show ${t} nodes` : `Hide ${t} nodes`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TYPE_COLORS[t] }} />
                {t}
              </button>
            );
          })}
        </div>
        <div className="flex overflow-hidden rounded-lg border border-parchment-300 text-xs dark:border-parchment-700">
          {(
            [
              ['type', 'By type'],
              ['cluster', 'By cluster'],
            ] as Array<['type' | 'cluster', string]>
          ).map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => switchColorMode(mode)}
              title={mode === 'cluster' ? 'Linked nodes share a color' : 'Color by node type'}
              className={`px-2.5 py-1.5 font-medium transition ${
                colorMode === mode
                  ? 'bg-parchment-200 text-ink dark:bg-parchment-700 dark:text-ink-invert'
                  : 'bg-white text-ink-faint hover:text-ink-soft dark:bg-parchment-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <label
          className="flex items-center gap-1.5 text-ink-faint"
          title="Node size"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
          <input
            type="range"
            min={0.35}
            max={1.4}
            step={0.05}
            value={nodeScale}
            onChange={(e) => changeNodeScale(Number(e.target.value))}
            className="w-20 accent-gold"
            aria-label="Node size"
          />
          <span className="inline-block h-3 w-3 rounded-full bg-current" />
        </label>
        <span className="ml-auto hidden text-xs text-ink-faint md:block">
          drag to arrange (drops stay put) · drop onto a node to link · double-click a verse to read
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1">
        <div ref={canvasBox} className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-faint">
              Loading your graph…
            </div>
          ) : loadError ? (
            <div className="flex h-full items-center justify-center text-sm text-red-700">
              {loadError}
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-sm text-center">
                <p className="font-display text-2xl text-ink-faint">An empty canvas</p>
                <p className="mt-2 text-sm text-ink-faint">
                  Create your first node, or select verses in the reader and press{' '}
                  <kbd className="rounded border border-parchment-300 px-1.5 dark:border-parchment-700">g</kbd>{' '}
                  to plant them here.
                </p>
              </div>
            </div>
          ) : (
            width > 0 && (
              <KnowledgeGraph
                nodes={nodes}
                edges={edges}
                width={width}
                height={height}
                dark={dark}
                selectedId={selectedId}
                hiddenTypes={hiddenTypes}
                search={search}
                colorMode={colorMode}
                clusterColors={clusterColors}
                nodeScale={nodeScale}
                onSelect={setSelectedId}
                onOpenVerse={(n: RuntimeNode) => n.verse_ref && openVerse(n.verse_ref)}
                onLink={handleLink}
                onPinNode={handlePinNode}
              />
            )
          )}
        </div>

        {selected && (
          <aside className="absolute inset-y-0 right-0 z-10 w-full max-w-96 border-l border-parchment-300 bg-parchment-50 shadow-xl md:static md:shrink-0 md:shadow-none dark:border-parchment-700 dark:bg-parchment-800">
            <NodeEditor
              key={selected.id}
              node={selected}
              nodes={nodes}
              edges={edges}
              dark={dark}
              onSave={handleSave}
              onDelete={handleDelete}
              onConnect={(targetId) => handleLink(selected.id, targetId)}
              onEdgeLabel={handleEdgeLabel}
              onEdgeDelete={handleEdgeDelete}
              onOpenVerse={openVerse}
              onReleasePosition={selected.x != null ? handleReleasePosition : undefined}
              onClose={() => setSelectedId(null)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
