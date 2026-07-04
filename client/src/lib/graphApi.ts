import { api } from './api';

export type NodeType = 'theme' | 'person' | 'place' | 'verse' | 'idea';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  body_md: string;
  verse_ref: string | null;
  color: string | null;
}

export interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  label: string | null;
}

export interface NodeInput {
  label: string;
  type: NodeType;
  body_md: string;
  verse_ref: string | null;
  color: string | null;
}

export const TYPE_COLORS: Record<NodeType, string> = {
  theme: '#b48a3c',
  person: '#2f6f6a',
  place: '#7a4a8b',
  verse: '#8b3a3a',
  idea: '#4a6fa5',
};

export async function fetchGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  return (await api.get('/graph')).data;
}

export async function createNode(input: NodeInput): Promise<GraphNode> {
  return (await api.post('/graph/nodes', input)).data.node;
}

export async function updateNode(id: string, input: NodeInput): Promise<GraphNode> {
  return (await api.put(`/graph/nodes/${id}`, input)).data.node;
}

export async function deleteNode(id: string): Promise<void> {
  await api.delete(`/graph/nodes/${id}`);
}

export async function createEdge(
  source_id: string,
  target_id: string,
  label?: string,
): Promise<GraphEdge> {
  return (await api.post('/graph/edges', { source_id, target_id, label: label ?? null })).data.edge;
}

export async function updateEdge(id: string, label: string | null): Promise<GraphEdge> {
  return (await api.put(`/graph/edges/${id}`, { label })).data.edge;
}

export async function deleteEdge(id: string): Promise<void> {
  await api.delete(`/graph/edges/${id}`);
}

/**
 * After adding verse nodes, ask the server which of the user's existing theme
 * nodes each verse genuinely relates to, and create labeled edges for the
 * matches. Returns the number of edges created. Best-effort: callers should
 * treat failures as non-fatal.
 */
export async function autoLinkVersesToThemes(
  verses: Array<{ nodeId: string; ref: string; text?: string | null }>,
  excludeThemeIds: string[] = [],
): Promise<number> {
  if (verses.length === 0) return 0;
  const { nodes } = await fetchGraph();
  const excluded = new Set(excludeThemeIds);
  const themeByLabel = new Map<string, GraphNode>();
  for (const n of nodes) {
    if (n.type === 'theme' && !excluded.has(n.id) && !themeByLabel.has(n.label.toLowerCase())) {
      themeByLabel.set(n.label.toLowerCase(), n);
    }
  }
  if (themeByLabel.size === 0) return 0;

  const { data } = await api.post<{ matches: Array<{ ref: string; themes: string[] }> }>(
    '/graph/autolink',
    {
      verses: verses.slice(0, 25).map((v) => ({ ref: v.ref, text: v.text ?? undefined })),
      themes: [...themeByLabel.values()].map((t) => t.label).slice(0, 40),
    },
  );

  const nodeByRef = new Map(verses.map((v) => [v.ref, v.nodeId]));
  let created = 0;
  for (const match of data.matches) {
    const verseNodeId = nodeByRef.get(match.ref);
    if (!verseNodeId) continue;
    for (const themeLabel of match.themes) {
      const theme = themeByLabel.get(themeLabel.toLowerCase());
      if (!theme) continue;
      try {
        await createEdge(theme.id, verseNodeId, theme.label);
        created += 1;
      } catch {
        // edge may already exist or node vanished — keep going
      }
    }
  }
  return created;
}
