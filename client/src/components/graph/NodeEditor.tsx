import MDEditor from '@uiw/react-md-editor';
import { useEffect, useRef, useState } from 'react';
import { TYPE_COLORS, type GraphEdge, type GraphNode, type NodeInput, type NodeType } from '../../lib/graphApi';
import { LinkSuggestions } from './LinkSuggestions';

const NODE_TYPES: NodeType[] = ['idea', 'theme', 'person', 'place', 'verse'];

const inputCls =
  'rounded-lg border border-parchment-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-gold dark:border-parchment-700 dark:bg-parchment-900 dark:text-ink-invert';

interface NodeEditorProps {
  node: GraphNode;
  nodes: GraphNode[];
  edges: GraphEdge[];
  dark: boolean;
  onSave: (id: string, input: NodeInput) => void;
  onDelete: (id: string) => void;
  onConnect: (targetId: string) => void;
  onEdgeLabel: (edgeId: string, label: string | null) => void;
  onEdgeDelete: (edgeId: string) => void;
  onOpenVerse: (verseRef: string) => void;
  onReleasePosition?: (id: string) => void;
  onClose: () => void;
}

export function NodeEditor({
  node,
  nodes,
  edges,
  dark,
  onSave,
  onDelete,
  onConnect,
  onEdgeLabel,
  onEdgeDelete,
  onOpenVerse,
  onReleasePosition,
  onClose,
}: NodeEditorProps) {
  const [label, setLabel] = useState(node.label);
  const [type, setType] = useState<NodeType>(node.type);
  const [verseRef, setVerseRef] = useState(node.verse_ref ?? '');
  const [body, setBody] = useState(node.body_md);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    setLabel(node.label);
    setType(node.type);
    setVerseRef(node.verse_ref ?? '');
    setBody(node.body_md);
    dirty.current = false;
  }, [node.id]);

  // Debounced autosave: persist 700ms after the last keystroke.
  useEffect(() => {
    if (!dirty.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onSave(node.id, {
        label: label.trim() || 'Untitled',
        type,
        body_md: body,
        verse_ref: verseRef.trim() || null,
        color: TYPE_COLORS[type],
      });
      dirty.current = false;
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [label, type, verseRef, body]);

  function touch<T>(setter: (v: T) => void) {
    return (v: T) => {
      dirty.current = true;
      setter(v);
    };
  }

  const myEdges = edges.filter((e) => e.source_id === node.id || e.target_id === node.id);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4" data-color-mode={dark ? 'dark' : 'light'}>
      <div className="flex items-center justify-between">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: TYPE_COLORS[type] }}
        />
        <button
          onClick={onClose}
          aria-label="Close editor"
          className="rounded-lg p-1 text-ink-faint hover:bg-parchment-200 dark:hover:bg-parchment-700"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <input
        value={label}
        onChange={(e) => touch(setLabel)(e.target.value)}
        className={`${inputCls} font-display text-lg`}
        placeholder="Node label…"
      />

      <div className="flex gap-2">
        <select value={type} onChange={(e) => touch(setType)(e.target.value as NodeType)} className={inputCls}>
          {NODE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={verseRef}
          onChange={(e) => touch(setVerseRef)(e.target.value)}
          placeholder="Verse ref (e.g. John 3:16)"
          className={`${inputCls} flex-1`}
        />
      </div>

      {node.verse_ref && (
        <button
          onClick={() => onOpenVerse(node.verse_ref!)}
          className="self-start text-sm text-teal hover:underline dark:text-gold-soft"
        >
          Open {node.verse_ref} in reader →
        </button>
      )}

      <div className="min-h-48">
        <MDEditor value={body} onChange={(v) => touch(setBody)(v ?? '')} height={200} preview="edit" visibleDragbar={false} />
      </div>

      {myEdges.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-faint">Links</h4>
          <ul className="mt-2 space-y-1.5">
            {myEdges.map((e) => {
              const otherId = e.source_id === node.id ? e.target_id : e.source_id;
              const other = nodeById.get(otherId);
              return (
                <li key={e.id} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{other?.label ?? '…'}</span>
                  <input
                    defaultValue={e.label ?? ''}
                    placeholder="label"
                    onBlur={(ev) => {
                      const v = ev.target.value.trim();
                      if (v !== (e.label ?? '')) onEdgeLabel(e.id, v || null);
                    }}
                    className={`${inputCls} w-28 px-2 py-1 text-xs`}
                  />
                  <button
                    onClick={() => onEdgeDelete(e.id)}
                    aria-label="Remove link"
                    className="text-ink-faint hover:text-red-700"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <LinkSuggestions node={node} nodes={nodes} edges={edges} onConnect={onConnect} />

      <div className="mt-auto flex items-center gap-3">
        <button
          onClick={() => onDelete(node.id)}
          className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 transition hover:bg-red-50 dark:hover:bg-red-950"
        >
          Delete node
        </button>
        {onReleasePosition && (
          <button
            onClick={() => onReleasePosition(node.id)}
            title="Unpin this node and let the layout place it"
            className="rounded-lg border border-parchment-300 px-3 py-1.5 text-sm text-ink-soft transition hover:border-gold dark:border-parchment-700 dark:text-ink-invert"
          >
            Release position
          </button>
        )}
      </div>
    </div>
  );
}
