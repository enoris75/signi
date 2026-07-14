import { COMPLEMENT_TYPES } from "@signi/shared";
import type { ComplementType, Concept, GrammaticalRole } from "@signi/shared";

/**
 * The word map: the corpus seen as a graph rather than as the flat per-role lists the palette
 * shows. Two relations are drawn, and they are of different shapes — which is what the layout
 * below has to cope with.
 *
 * `isA` relates two *concepts* (CARAVEL is_a SAILING_SHIP). Every concept has at most one parent,
 * so these edges form a forest of shallow trees.
 *
 * `complements` relates a *verb* to the complement types it licenses (CUT takes an instrumental).
 * A complement type is not a word — it is a grammatical category — so it becomes its own kind of
 * node, and since most verbs license `cause` those nodes are hubs with a high degree.
 */

export type RelationKind = "isA" | "complements";

export const RELATION_KINDS: RelationKind[] = ["isA", "complements"];

/** A complement type's node id. Namespaced so it can never collide with a concept id. */
export const complementNodeId = (type: ComplementType) => `complement:${type}`;

export interface WordMapNode {
  id: string;
  label: string;
  /** `word` nodes are concepts; `complement` nodes are the grammatical categories verbs license. */
  kind: "word" | "complement";
  /** Set on word nodes only — drives the colour, matching the palette's role colours. */
  role?: GrammaticalRole;
  concept?: Concept;
  /** How many edges touch the node. Hubs are laid out with more room around them. */
  degree: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface WordMapEdge {
  /** The specific end: the child concept for `isA`, the verb for `complements`. */
  source: string;
  /** The general end: the parent concept for `isA`, the complement type for `complements`. */
  target: string;
  relation: RelationKind;
}

export interface WordMapGraph {
  nodes: WordMapNode[];
  edges: WordMapEdge[];
  /** Concepts left out because no shown relation touches them — reported, not drawn. */
  unconnected: number;
}

/**
 * Builds the graph for the relations currently switched on. Only concepts an edge touches become
 * nodes: with the relations we have today most of the corpus is unrelated to everything else, and
 * drawing ~140 isolated words around a handful of trees would bury them. The count of what was
 * left out is returned so the map can say so rather than silently omitting it.
 */
export function buildWordMap(
  concepts: Concept[],
  relations: ReadonlySet<RelationKind>,
  labelOf: (concept: Concept) => string,
  complementLabelOf: (type: ComplementType) => string,
): WordMapGraph {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const edges: WordMapEdge[] = [];

  if (relations.has("isA")) {
    for (const concept of concepts) {
      // A parent missing from the list means the caller filtered by role; skip the dangling edge.
      if (concept.isA && byId.has(concept.isA)) {
        edges.push({ source: concept.id, target: concept.isA, relation: "isA" });
      }
    }
  }

  if (relations.has("complements")) {
    for (const concept of concepts) {
      for (const type of concept.complements ?? []) {
        edges.push({
          source: concept.id,
          target: complementNodeId(type),
          relation: "complements",
        });
      }
    }
  }

  const degrees = new Map<string, number>();
  for (const edge of edges) {
    degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
    degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);
  }

  const nodes: WordMapNode[] = [];
  for (const concept of concepts) {
    const degree = degrees.get(concept.id) ?? 0;
    if (degree === 0) continue;
    nodes.push({
      id: concept.id,
      label: labelOf(concept),
      kind: "word",
      role: concept.role,
      concept,
      degree,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    });
  }
  for (const type of COMPLEMENT_TYPES) {
    const id = complementNodeId(type);
    const degree = degrees.get(id) ?? 0;
    if (degree === 0) continue;
    nodes.push({
      id,
      label: complementLabelOf(type),
      kind: "complement",
      degree,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    });
  }

  return { nodes, edges, unconnected: concepts.length - nodes.filter((n) => n.kind === "word").length };
}

// ── Layout ───────────────────────────────────────────────────────────────────
//
// A force-directed layout, run to completion before the first paint rather than animated: the
// map opens settled, and re-opening it gives the same picture (the seeding below is a hash of
// the node id, not Math.random, so the result is reproducible). At this size the O(n²) repulsion
// pass is a few tens of thousands of operations per tick and costs a handful of milliseconds in
// total — a quadtree would be a pure complication.
//
// A force layout is used rather than a tidy tree because the two relations disagree about shape:
// `isA` is a forest, which a tree layout would draw beautifully, but `complements` is a dense
// hub-and-spoke that no hierarchical layout can place without crossing everything. Springs handle
// both, and handle them together.

const REPULSION = 5200;
const SPRING = 0.045;
const GRAVITY = 0.012;
const DAMPING = 0.85;
const ITERATIONS = 420;

/** Rest lengths differ by relation: a hub's spokes need more room than a parent's children. */
const REST_LENGTH: Record<RelationKind, number> = { isA: 78, complements: 150 };

/** Deterministic [0,1) from a node id, so a given corpus always lays out the same way. */
function hashUnit(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Positions the nodes in place, inside a `width` × `height` box. Returns the graph for chaining.
 */
export function layoutWordMap(graph: WordMapGraph, width: number, height: number): WordMapGraph {
  const { nodes, edges } = graph;
  if (nodes.length === 0) return graph;

  const cx = width / 2;
  const cy = height / 2;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Seed on a spiral rather than a circle: a circle puts every node at the same radius, and the
  // repulsion pass then has to unpack a shell from the outside in, which converges slowly.
  const radius = Math.min(width, height) * 0.42;
  nodes.forEach((node, i) => {
    const angle = hashUnit(node.id) * Math.PI * 2;
    const r = radius * Math.sqrt((i + 0.5) / nodes.length);
    node.x = cx + Math.cos(angle) * r;
    node.y = cy + Math.sin(angle) * r;
    node.vx = 0;
    node.vy = 0;
  });

  for (let step = 0; step < ITERATIONS; step++) {
    // Cooling: large moves early to untangle, small ones late to settle without jitter.
    const alpha = 1 - step / ITERATIONS;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        // Two nodes exactly on top of each other have no direction to separate along; nudge them
        // apart deterministically so the force has something to act on.
        if (d2 < 0.01) {
          dx = hashUnit(a.id + b.id) - 0.5;
          dy = hashUnit(b.id + a.id) - 0.5;
          d2 = dx * dx + dy * dy || 0.01;
        }
        const d = Math.sqrt(d2);
        // Hubs push harder, in proportion to what they have to hold at arm's length.
        const strength =
          (REPULSION * (1 + Math.min(a.degree, 12) * 0.12) * (1 + Math.min(b.degree, 12) * 0.12)) /
          d2;
        const fx = (dx / d) * strength;
        const fy = (dy / d) * strength;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    for (const edge of edges) {
      const a = byId.get(edge.source);
      const b = byId.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const force = (d - REST_LENGTH[edge.relation]) * SPRING;
      const fx = (dx / d) * force;
      const fy = (dy / d) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    for (const node of nodes) {
      node.vx += (cx - node.x) * GRAVITY;
      node.vy += (cy - node.y) * GRAVITY;
      node.x += node.vx * alpha;
      node.y += node.vy * alpha;
      node.vx *= DAMPING;
      node.vy *= DAMPING;
    }
  }

  return graph;
}

/** The bounding box of the laid-out nodes, padded — what the SVG viewBox should frame. */
export function graphExtent(
  graph: WordMapGraph,
  padding: number,
): { x: number; y: number; width: number; height: number } {
  if (graph.nodes.length === 0) return { x: 0, y: 0, width: 100, height: 100 };
  const xs = graph.nodes.map((n) => n.x);
  const ys = graph.nodes.map((n) => n.y);
  const minX = Math.min(...xs) - padding;
  const minY = Math.min(...ys) - padding;
  const maxX = Math.max(...xs) + padding;
  const maxY = Math.max(...ys) + padding;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** The ids adjacent to `id`, plus `id` itself — what a hover keeps lit. */
export function neighbourhood(graph: WordMapGraph, id: string): Set<string> {
  const near = new Set<string>([id]);
  for (const edge of graph.edges) {
    if (edge.source === id) near.add(edge.target);
    if (edge.target === id) near.add(edge.source);
  }
  return near;
}
