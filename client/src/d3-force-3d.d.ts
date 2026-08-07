// Minimal ambient types for the one function this app uses from d3-force-3d
// (force-graph's own force-simulation dependency, already resolvable via
// npm workspace hoisting — no upstream @types package covers this fork).
declare module 'd3-force-3d' {
  export interface ForceCollide<NodeDatum> {
    (alpha: number): void;
    initialize?: (nodes: NodeDatum[]) => void;
    radius(
      radius: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
    ): ForceCollide<NodeDatum>;
    strength(strength: number): ForceCollide<NodeDatum>;
    iterations(iterations: number): ForceCollide<NodeDatum>;
  }

  export function forceCollide<NodeDatum = unknown>(
    radius?: number | ((node: NodeDatum, i: number, nodes: NodeDatum[]) => number),
  ): ForceCollide<NodeDatum>;
}
