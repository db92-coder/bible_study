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
