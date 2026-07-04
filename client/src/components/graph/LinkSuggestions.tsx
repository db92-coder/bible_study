import { useMemo } from 'react';
import type { GraphEdge, GraphNode } from '../../lib/graphApi';

const STOPWORDS = new Set(['the', 'and', 'of', 'in', 'to', 'a', 'for', 'with', 'his', 'her']);

interface Suggestion {
  node: GraphNode;
  reason: string;
}

export function LinkSuggestions({
  node,
  nodes,
  edges,
  onConnect,
}: {
  node: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onConnect: (targetId: string) => void;
}) {
  const suggestions = useMemo<Suggestion[]>(() => {
    const linked = new Set<string>();
    for (const e of edges) {
      if (e.source_id === node.id) linked.add(e.target_id);
      if (e.target_id === node.id) linked.add(e.source_id);
    }
    const words = new Set(
      node.label
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 3 && !STOPWORDS.has(w)),
    );
    const myBook = node.verse_ref?.split(/\s+\d/)[0]?.toLowerCase() ?? null;

    const out: Suggestion[] = [];
    for (const other of nodes) {
      if (other.id === node.id || linked.has(other.id)) continue;
      const otherWords = other.label
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 3 && !STOPWORDS.has(w));
      const shared = otherWords.find((w) => words.has(w));
      if (shared) {
        out.push({ node: other, reason: `both mention “${shared}”` });
        continue;
      }
      const otherBook = other.verse_ref?.split(/\s+\d/)[0]?.toLowerCase() ?? null;
      if (myBook && otherBook && myBook === otherBook) {
        out.push({ node: other, reason: `both anchored in ${other.verse_ref?.split(/\s+\d/)[0]}` });
      }
    }
    return out.slice(0, 5);
  }, [node, nodes, edges]);

  if (suggestions.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">
        Suggested links
      </h4>
      <ul className="mt-2 space-y-1.5">
        {suggestions.map((s) => (
          <li key={s.node.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate">
              {s.node.label} <span className="text-xs text-ink-faint">— {s.reason}</span>
            </span>
            <button
              onClick={() => onConnect(s.node.id)}
              className="shrink-0 rounded-md border border-parchment-300 px-2 py-0.5 text-xs text-teal transition hover:border-gold dark:border-parchment-700 dark:text-gold-soft"
            >
              Link
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
