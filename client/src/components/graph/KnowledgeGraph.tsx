import { useCallback, useMemo, useRef } from 'react';
import ForceGraph2D, {
  type ForceGraphMethods,
  type LinkObject,
  type NodeObject,
} from 'react-force-graph-2d';
import { TYPE_COLORS, type GraphEdge, type GraphNode, type NodeType } from '../../lib/graphApi';

export interface RuntimeNode extends NodeObject {
  id: string;
  label: string;
  type: NodeType;
  verse_ref: string | null;
  color: string;
}

interface RuntimeLink extends LinkObject {
  id: string;
  label: string | null;
}

const LINK_SNAP_DISTANCE = 18;

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  dark: boolean;
  selectedId: string | null;
  hiddenTypes: Set<NodeType>;
  search: string;
  colorMode: 'type' | 'cluster';
  clusterColors: Map<string, string>;
  onSelect: (id: string | null) => void;
  onOpenVerse: (node: RuntimeNode) => void;
  onLink: (sourceId: string, targetId: string) => void;
  onPinNode: (id: string, x: number, y: number) => void;
}

export function KnowledgeGraph({
  nodes,
  edges,
  width,
  height,
  dark,
  selectedId,
  hiddenTypes,
  search,
  colorMode,
  clusterColors,
  onSelect,
  onOpenVerse,
  onLink,
  onPinNode,
}: KnowledgeGraphProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  // Runtime node objects persist across renders so the simulation keeps
  // positions when data changes (force-graph mutates them with x/y/vx/vy).
  const runtime = useRef(new Map<string, RuntimeNode>());
  const lastClick = useRef<{ id: string; time: number }>({ id: '', time: 0 });

  const graphData = useMemo(() => {
    const ids = new Set(nodes.map((n) => n.id));
    for (const key of runtime.current.keys()) {
      if (!ids.has(key)) runtime.current.delete(key);
    }
    const nodeObjs = nodes.map((n) => {
      const obj = runtime.current.get(n.id) ?? ({ id: n.id } as RuntimeNode);
      obj.label = n.label;
      obj.type = n.type;
      obj.verse_ref = n.verse_ref;
      obj.color = n.color ?? TYPE_COLORS[n.type];
      // Saved position → pinned; cleared position → released back to physics.
      if (n.x != null && n.y != null) {
        if (obj.fx == null) {
          obj.x = n.x;
          obj.y = n.y;
        }
        obj.fx = n.x;
        obj.fy = n.y;
      } else {
        delete obj.fx;
        delete obj.fy;
      }
      runtime.current.set(n.id, obj);
      return obj;
    });
    const links: RuntimeLink[] = edges
      .filter((e) => runtime.current.has(e.source_id) && runtime.current.has(e.target_id))
      .map((e) => ({
        id: e.id,
        source: runtime.current.get(e.source_id)!,
        target: runtime.current.get(e.target_id)!,
        label: e.label,
      }));
    return { nodes: nodeObjs, links };
  }, [nodes, edges]);

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = useCallback(
    (n: RuntimeNode) => searchLower === '' || n.label.toLowerCase().includes(searchLower),
    [searchLower],
  );

  const nodeCanvasObject = useCallback(
    (nodeObj: NodeObject, ctx: CanvasRenderingContext2D, scale: number) => {
      const node = nodeObj as RuntimeNode;
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const selected = node.id === selectedId;
      const matched = matchesSearch(node);
      const r = selected ? 8 : 6;
      const fill =
        colorMode === 'cluster' ? (clusterColors.get(node.id) ?? node.color) : node.color;

      ctx.globalAlpha = matched ? 1 : 0.15;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();

      // Pinned nodes get a small anchor dot
      if (node.fx != null) {
        ctx.beginPath();
        ctx.arc(x, y, 1.8, 0, 2 * Math.PI);
        ctx.fillStyle = dark ? '#1d1a15' : '#f6f1e7';
        ctx.fill();
      }

      if (selected) {
        ctx.lineWidth = 2 / scale;
        ctx.strokeStyle = dark ? '#d9b56d' : '#2b2118';
        ctx.stroke();
      }
      if (searchLower !== '' && matched) {
        ctx.lineWidth = 1.5 / scale;
        ctx.strokeStyle = '#b48a3c';
        ctx.beginPath();
        ctx.arc(x, y, r + 3 / scale, 0, 2 * Math.PI);
        ctx.stroke();
      }

      if (scale > 1.1 || selected || (searchLower !== '' && matched)) {
        const fontSize = Math.max(11 / scale, 2.5);
        ctx.font = `${selected ? '600 ' : ''}${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = dark ? '#ece5d8' : '#2b2118';
        ctx.fillText(node.label, x, y + r + 2 / scale);
      }
      ctx.globalAlpha = 1;
    },
    [selectedId, matchesSearch, searchLower, dark, colorMode, clusterColors],
  );

  const linkCanvasObject = useCallback(
    (linkObj: LinkObject, ctx: CanvasRenderingContext2D, scale: number) => {
      const link = linkObj as RuntimeLink;
      if (!link.label || scale < 1.4) return;
      const src = link.source as RuntimeNode;
      const tgt = link.target as RuntimeNode;
      if (src.x == null || tgt.x == null) return;
      const mx = ((src.x ?? 0) + (tgt.x ?? 0)) / 2;
      const my = ((src.y ?? 0) + (tgt.y ?? 0)) / 2;
      const fontSize = Math.max(9 / scale, 2);
      ctx.font = `italic ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = dark ? '#8a7d6a' : '#7a6f5f';
      ctx.fillText(link.label, mx, my - 3 / scale);
    },
    [dark],
  );

  return (
    <ForceGraph2D
      ref={fgRef}
      width={width}
      height={height}
      graphData={graphData}
      backgroundColor="rgba(0,0,0,0)"
      nodeCanvasObject={nodeCanvasObject}
      nodePointerAreaPaint={(nodeObj, color, ctx) => {
        const node = nodeObj as RuntimeNode;
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, 10, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }}
      nodeVisibility={(n) => !hiddenTypes.has((n as RuntimeNode).type)}
      linkVisibility={(l) =>
        !hiddenTypes.has(((l as RuntimeLink).source as RuntimeNode).type) &&
        !hiddenTypes.has(((l as RuntimeLink).target as RuntimeNode).type)
      }
      linkColor={(l) => {
        if (colorMode === 'cluster') {
          const src = (l as RuntimeLink).source as RuntimeNode;
          const c = clusterColors.get(src.id);
          if (c) return `${c}66`; // cluster color at ~40% opacity
        }
        return dark ? '#5a5346' : '#c9bda3';
      }}
      linkWidth={1.2}
      linkCanvasObjectMode={() => 'after'}
      linkCanvasObject={linkCanvasObject}
      d3VelocityDecay={0.32}
      cooldownTicks={120}
      onNodeClick={(nodeObj) => {
        const node = nodeObj as RuntimeNode;
        const now = Date.now();
        const isDouble = lastClick.current.id === node.id && now - lastClick.current.time < 350;
        lastClick.current = { id: node.id, time: now };
        if (isDouble && node.type === 'verse' && node.verse_ref) {
          onOpenVerse(node);
        } else {
          onSelect(node.id);
        }
      }}
      onBackgroundClick={() => onSelect(null)}
      onNodeDragEnd={(nodeObj) => {
        const node = nodeObj as RuntimeNode;
        // Drop a node onto another to link them, Obsidian-style.
        let nearest: RuntimeNode | null = null;
        let nearestDist = Infinity;
        for (const other of runtime.current.values()) {
          if (other.id === node.id || hiddenTypes.has(other.type)) continue;
          const dx = (other.x ?? 0) - (node.x ?? 0);
          const dy = (other.y ?? 0) - (node.y ?? 0);
          const dist = Math.hypot(dx, dy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = other;
          }
        }
        if (nearest && nearestDist < LINK_SNAP_DISTANCE) {
          onLink(node.id, nearest.id);
          return;
        }
        // Otherwise: the user placed this node deliberately — pin it there.
        if (node.x != null && node.y != null) {
          node.fx = node.x;
          node.fy = node.y;
          onPinNode(node.id, node.x, node.y);
        }
      }}
    />
  );
}
