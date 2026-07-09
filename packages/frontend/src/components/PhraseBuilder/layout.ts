import { COMPLEMENT_LABELS, COMPLEMENT_TYPES } from "@signi/shared";
import {
  COMPACT_PAD_BOT,
  COMPACT_PAD_H,
  COMPACT_PAD_TOP,
  PIX_PAD_BOT,
  PIX_PAD_H,
  PIX_PAD_TOP,
  ROUTE_PAD_TOP,
  type GroupRect,
} from "./graph.ts";
import { DEFAULT_POSITIONS } from "./slots.ts";

// Node positions on the canvas, in % of the canvas box, keyed by node key.
export type PositionMap = Record<string, { x: number; y: number }>;

export type CanvasSize = { w: number; h: number };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Row-compact one dotted box's child nodes into a tidy cluster centered on
// `center` (% coords): adjectives (and the tense chip) on a top row, the main word
// in the middle, and the adverb / determiner nodes on a bottom row.
// Each row is horizontally centered, so the group's derived bounding box shrinks to
// a neat, minimal footprint. Returns the new positions for just this group's keys.
export function tidyGroupPositions(
  nodeKeys: string[],
  center: { x: number; y: number },
  svgSize: CanvasSize,
): PositionMap {
  // Convert a comfortable per-node pixel spacing into the % coordinate space.
  const stepX = (150 / Math.max(svgSize.w, 1)) * 100;
  const stepY = (68 / Math.max(svgSize.h, 1)) * 100;
  // -1 = top row (adjectives / tense), 0 = main word, 1 = bottom row (toggles).
  const tierOf = (k: string): -1 | 0 | 1 => {
    if (/Adjective\d?$/.test(k) || k === "verbTense" || k === "verbAspect") return -1;
    if (/Definiteness$/.test(k) || k === "modifier") return 1;
    return 0;
  };
  const rows: Record<number, string[]> = { [-1]: [], 0: [], 1: [] };
  for (const k of nodeKeys) rows[tierOf(k)].push(k);
  const out: PositionMap = {};
  for (const tier of [-1, 0, 1] as const) {
    const row = rows[tier];
    const rowY = clamp(center.y + tier * stepY, 4, 96);
    const startX = center.x - ((row.length - 1) * stepX) / 2;
    row.forEach((k, i) => {
      out[k] = { x: clamp(startX + i * stepX, 2, 98), y: rowY };
    });
  }
  return out;
}

// Re-arrange a single dotted box in place — compact its child nodes around the group's
// own current center. Returns the new positions for just this group's keys.
export function rearrangeGroupPositions(
  nodeKeys: string[],
  positions: PositionMap,
  svgSize: CanvasSize,
): PositionMap {
  const cur = nodeKeys.map(
    (k) => positions[k] ?? DEFAULT_POSITIONS[k] ?? { x: 50, y: 50 },
  );
  const center = {
    x: cur.reduce((s, p) => s + p.x, 0) / cur.length,
    y: cur.reduce((s, p) => s + p.y, 0) / cur.length,
  };
  return tidyGroupPositions(nodeKeys, center, svgSize);
}

// Node y's are stored as a % of the canvas box, and the canvas box is exactly as tall as
// the period container's graph height. Changing that height alone would therefore slide
// every node vertically — a taller container spreads them apart, a shorter one bunches
// them up. Re-express each y against the new height so the node keeps the same pixel
// offset from the canvas top: resizing then only adds or removes space at the bottom.
// x is untouched — the canvas width doesn't change on a vertical resize.
export function rescaleYForHeight(
  positions: PositionMap,
  prevH: number,
  nextH: number,
): PositionMap {
  if (prevH <= 0 || nextH <= 0 || prevH === nextH) return positions;
  const ratio = prevH / nextH;
  const out: PositionMap = {};
  for (const [key, p] of Object.entries(positions)) {
    // Shrinking past the content can push a node off the bottom; pin it to the same
    // 1..99 band a drag clamps to rather than letting it leave the canvas.
    out[key] = { x: p.x, y: clamp(p.y * ratio, 1, 99) };
  }
  return out;
}

// Reading order for the tidied period; boxes with a label not listed sort to the end.
const READING_ORDER = [
  "Subject",
  "Verb Phrase",
  "Direct Object",
  "Indirect Object",
  ...COMPLEMENT_TYPES.map((t) => COMPLEMENT_LABELS[t]),
];

// Tidy the whole period: pack every (collapsed) dotted box into non-overlapping rows in
// reading order — subject · verb phrase · direct object · indirect object · complements.
// Returns the labels to collapse and the new positions for every packed group's nodes;
// the caller commits both, so one click re-flows the whole container into a clean grid.
export function packPeriod(
  groupRects: GroupRect[],
  svgSize: CanvasSize,
): { labels: string[]; positions: PositionMap } {
  const rank = (label: string) => {
    const i = READING_ORDER.indexOf(label);
    return i === -1 ? READING_ORDER.length : i;
  };
  const boxes = [...groupRects].sort((a, b) => rank(a.label) - rank(b.label));

  // A collapsed box wraps just its main word: a fixed width plus the standard
  // padding — the route box needs extra headroom for its path toolbar. These match
  // graph.ts exactly, so the packed spacing reproduces the rendered box footprint.
  const boxW = 2 * PIX_PAD_H;
  const padTopOf = (g: GroupRect) =>
    g.removeKey === "route" || g.removeKey === "cause"
      ? PIX_PAD_TOP + ROUTE_PAD_TOP
      : PIX_PAD_TOP;
  const boxHOf = (g: GroupRect) => padTopOf(g) + PIX_PAD_BOT;

  const gap = 20; // gutter between boxes, px
  const margin = 6;
  const { w: svgW, h: svgH } = svgSize;
  // How many equal-width boxes fit across the canvas (at least one per row).
  const perRow = Math.max(1, Math.floor((svgW - 2 * margin + gap) / (boxW + gap)));
  const rows: GroupRect[][] = [];
  for (let i = 0; i < boxes.length; i += perRow)
    rows.push(boxes.slice(i, i + perRow));
  const rowHeights = rows.map((row) => Math.max(...row.map(boxHOf)));
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);

  const positions: PositionMap = {};
  // Center the whole stack vertically; center each row horizontally.
  let boxTop = Math.max(margin, (svgH - totalH) / 2);
  rows.forEach((row, r) => {
    const rowW = row.length * boxW + gap * (row.length - 1);
    let boxLeft = Math.max(margin, (svgW - rowW) / 2);
    for (const g of row) {
      // Convert the box's top-left corner back to its main word's center (px → %),
      // then compact the group around it (only the main word survives collapse).
      const center = {
        x: ((boxLeft + PIX_PAD_H) / Math.max(svgW, 1)) * 100,
        y: ((boxTop + padTopOf(g)) / Math.max(svgH, 1)) * 100,
      };
      Object.assign(positions, tidyGroupPositions(g.nodeKeys, center, svgSize));
      boxLeft += boxW + gap;
    }
    boxTop += rowHeights[r] + gap;
  });

  return { labels: boxes.map((g) => g.label), positions };
}

// Compact-view layout: pack the visible core words into centered rows and size the canvas
// to just wrap them. The caller derives (rather than stores) this each render, so it never
// goes stale on a resize and the full-view positions/height stay pristine.
export function computeCompactLayout(
  keys: string[],
  svgW: number,
): { positions: PositionMap; height: number } {
  const boxW = 2 * COMPACT_PAD_H;
  const rowH = COMPACT_PAD_TOP + COMPACT_PAD_BOT;
  const gap = 16;
  const margin = 4;
  const perRow = Math.max(1, Math.floor((svgW - 2 * margin + gap) / (boxW + gap)));
  const rows: string[][] = [];
  for (let i = 0; i < keys.length; i += perRow) rows.push(keys.slice(i, i + perRow));
  const height = Math.max(
    rowH,
    Math.round(rows.length * rowH + gap * Math.max(rows.length - 1, 0) + 2 * margin),
  );
  const positions: PositionMap = {};
  let top = margin;
  for (const row of rows) {
    const rowW = row.length * boxW + gap * (row.length - 1);
    let left = Math.max(margin, (svgW - rowW) / 2);
    for (const key of row) {
      positions[key] = {
        x: ((left + COMPACT_PAD_H) / Math.max(svgW, 1)) * 100,
        y: ((top + COMPACT_PAD_TOP) / Math.max(height, 1)) * 100,
      };
      left += boxW + gap;
    }
    top += rowH + gap;
  }
  return { positions, height };
}
