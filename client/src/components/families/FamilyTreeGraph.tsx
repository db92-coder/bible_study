import { forceCollide } from 'd3-force-3d';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import ForceGraph2D, { type ForceGraphMethods, type LinkObject, type NodeObject } from 'react-force-graph-2d';
import type { FamilyTree } from '../../lib/genealogyApi';

interface RuntimeNode extends NodeObject {
  id: string;
  name: string;
}

// Node circles are tiny (5-7px) — it's the text label below each one that
// actually needs the breathing room, so size the collision radius off the
// name length rather than the circle. A parent with a dozen children (the
// Table of Nations, the tribal lists) needs this or siblings' labels stack
// on top of each other.
function collideRadius(nodeObj: NodeObject): number {
  const name = (nodeObj as RuntimeNode).name ?? '';
  return 12 + name.length * 3.4;
}

interface RuntimeLink extends LinkObject {
  relationship: string;
}

interface FamilyTreeGraphProps {
  tree: FamilyTree;
  width: number;
  height: number;
  dark: boolean;
  rootId: string;
  search: string;
  onSelect: (id: string) => void;
}

export function FamilyTreeGraph({ tree, width, height, dark, rootId, search, onSelect }: FamilyTreeGraphProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

  const graphData = useMemo(() => {
    const nodeById = new Map(tree.nodes.map((n) => [n.id, { ...n } as RuntimeNode]));
    const links: RuntimeLink[] = tree.edges
      .filter((e) => nodeById.has(e.source) && nodeById.has(e.target))
      .map((e) => ({
        source: nodeById.get(e.source)!,
        target: nodeById.get(e.target)!,
        relationship: e.relationship,
      }));
    return { nodes: [...nodeById.values()], links };
  }, [tree]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    // Stronger repulsion than the default, plus an explicit collision force
    // sized to each label — the default charge alone isn't enough to keep
    // wide sibling groups (a parent with 10+ children) from overlapping.
    fg.d3Force('charge')?.strength(-160);
    fg.d3Force('collide', forceCollide<NodeObject>(collideRadius).strength(0.9).iterations(2));
  }, [graphData]);

  const searchLower = search.trim().toLowerCase();
  const matchesSearch = useCallback(
    (n: RuntimeNode) => searchLower === '' || n.name.toLowerCase().includes(searchLower),
    [searchLower],
  );

  const nodeCanvasObject = useCallback(
    (nodeObj: NodeObject, ctx: CanvasRenderingContext2D, scale: number) => {
      const node = nodeObj as RuntimeNode;
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const isRoot = node.id === rootId;
      const matched = matchesSearch(node);
      const r = isRoot ? 7 : 5;

      ctx.globalAlpha = matched ? 1 : 0.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isRoot ? '#b48a3c' : '#2f6f6a';
      ctx.fill();

      if (isRoot) {
        ctx.lineWidth = 2 / scale;
        ctx.strokeStyle = dark ? '#d9b56d' : '#2b2118';
        ctx.stroke();
      } else if (searchLower !== '' && matched) {
        ctx.lineWidth = 1.5 / scale;
        ctx.strokeStyle = '#b48a3c';
        ctx.beginPath();
        ctx.arc(x, y, r + 3 / scale, 0, 2 * Math.PI);
        ctx.stroke();
      }

      if (scale > 1 || isRoot || (searchLower !== '' && matched)) {
        const fontSize = Math.max(11 / scale, 3);
        ctx.font = `${isRoot ? '600 ' : ''}${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = dark ? '#ece5d8' : '#2b2118';
        ctx.fillText(node.name, x, y + r + 2 / scale);
      }
      ctx.globalAlpha = 1;
    },
    [rootId, matchesSearch, searchLower, dark],
  );

  return (
    <ForceGraph2D
      ref={fgRef}
      width={width}
      height={height}
      graphData={graphData}
      backgroundColor="rgba(0,0,0,0)"
      dagMode="td"
      dagLevelDistance={110}
      nodeCanvasObject={nodeCanvasObject}
      nodePointerAreaPaint={(nodeObj, color, ctx) => {
        const node = nodeObj as RuntimeNode;
        ctx.beginPath();
        ctx.arc(node.x ?? 0, node.y ?? 0, 9, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
      }}
      linkColor={() => (dark ? '#5a5346' : '#c9bda3')}
      linkWidth={1.2}
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      d3VelocityDecay={0.32}
      cooldownTicks={150}
      onNodeClick={(nodeObj) => onSelect((nodeObj as RuntimeNode).id)}
    />
  );
}
