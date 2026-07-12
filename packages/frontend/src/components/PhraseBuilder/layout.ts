import { COMPLEMENT_LABELS, COMPLEMENT_TYPES } from "@signi/shared";
import {
  COMPACT_PAD_BOT,
  COMPACT_PAD_H,
  COMPACT_PAD_TOP,
  rawGroupRect,
  type GroupRect,
  type GroupShape,
  type SizeFn,
} from "./graph.ts";
import { BOTTOM_MARGIN } from "./overlap.ts";

// Node positions on the canvas, in % of the canvas box, keyed by node key.
export type PositionMap = Record<string, { x: number; y: number }>;

export type CanvasSize = { w: number; h: number };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Clear space left between two neighbouring word boxes inside a dotted box, in canvas px.
// The vertical gap is what holds a satellite row off the main word rather than against it.
const NODE_GAP_X = 40;
const NODE_GAP_Y = 26;
// Clear space left between a tidied dotted box and the canvas edge it was nudged off.
const EDGE_MARGIN = 4;

// Row-compact one dotted box's child nodes into a tidy cluster centered on `center`
// (canvas px): adjectives (and the tense chip) on a top row, the main word in the middle,
// and the adverb / determiner nodes on a bottom row.
//
// Rows are laid out from each box's measured footprint rather than a fixed step, so a row
// of long words spreads to fit instead of stacking its boxes on top of one another, and a
// satellite row clears the main word by `NODE_GAP_Y` however tall that word's box is.
// Each row is horizontally centered on `center`. Returns positions (%) for this group's
// keys only, unclamped — the caller nudges the finished cluster back onto the canvas.
export function tidyGroupPositions(
  nodeKeys: string[],
  center: { x: number; y: number },
  svgSize: CanvasSize,
  sizeOf: SizeFn,
): PositionMap {
  // -1 = top row (adjectives / tense), 0 = main word, 1 = bottom row (toggles).
  const tierOf = (k: string): -1 | 0 | 1 => {
    if (/Adjective\d?$/.test(k) || k === "verbTense" || k === "verbAspect") return -1;
    if (/Definiteness$/.test(k) || k === "modifier") return 1;
    return 0;
  };
  const rows: Record<number, string[]> = { [-1]: [], 0: [], 1: [] };
  for (const k of nodeKeys) rows[tierOf(k)].push(k);

  // A row is as tall as its tallest box; an empty one takes no room at all, so a group
  // with no main word still separates its two satellite rows by the gap.
  const rowHeight = (row: string[]) =>
    row.length ? Math.max(...row.map((k) => sizeOf(k).h)) : 0;
  const mainH = rowHeight(rows[0]);
  const rowCenterY = (tier: -1 | 0 | 1) => {
    if (tier === 0) return center.y;
    const offset = mainH / 2 + NODE_GAP_Y + rowHeight(rows[tier]) / 2;
    return center.y + tier * offset;
  };

  const out: PositionMap = {};
  for (const tier of [-1, 0, 1] as const) {
    const row = rows[tier];
    if (row.length === 0) continue;
    const rowW =
      row.reduce((s, k) => s + sizeOf(k).w, 0) + NODE_GAP_X * (row.length - 1);
    const y = rowCenterY(tier);
    let left = center.x - rowW / 2;
    for (const k of row) {
      const { w } = sizeOf(k);
      out[k] = {
        x: ((left + w / 2) / Math.max(svgSize.w, 1)) * 100,
        y: (y / Math.max(svgSize.h, 1)) * 100,
      };
      left += w + NODE_GAP_X;
    }
  }
  return out;
}

// Re-arrange a single dotted box in place — compact its child nodes around the group's own
// current center, then slide the whole cluster back inside the canvas if the tidied
// footprint hangs off an edge. A cluster that ends up taller than the canvas doesn't get
// squashed to fit: it reports the height it needs and the caller grows the container.
export function rearrangeGroupPositions(
  group: GroupShape,
  pos: (key: string) => { x: number; y: number },
  svgSize: CanvasSize,
  sizeOf: SizeFn,
): { positions: PositionMap; minHeight: number } {
  const cur = group.nodeKeys.map((k) => pos(k));
  const center = {
    x: (cur.reduce((s, p) => s + p.x, 0) / cur.length / 100) * svgSize.w,
    y: (cur.reduce((s, p) => s + p.y, 0) / cur.length / 100) * svgSize.h,
  };
  const tidied = tidyGroupPositions(group.nodeKeys, center, svgSize, sizeOf);

  // The dotted box the tidied cluster traces out — this, not the bare nodes, is what has
  // to sit on the canvas, since it carries the group's controls on its border.
  const rect = rawGroupRect(group, (k) => tidied[k], svgSize, false, sizeOf);
  const right = svgSize.w - EDGE_MARGIN;
  // A box wider than the canvas can't be brought fully inside; pin its left edge and let
  // it overhang the right, which is where the nodes matter least.
  const dx =
    rect.x < EDGE_MARGIN || rect.width > right - EDGE_MARGIN
      ? EDGE_MARGIN - rect.x
      : Math.min(0, right - (rect.x + rect.width));
  const dy = Math.max(0, EDGE_MARGIN - rect.y);

  const positions: PositionMap = {};
  const dxPct = (dx / Math.max(svgSize.w, 1)) * 100;
  const dyPct = (dy / Math.max(svgSize.h, 1)) * 100;
  for (const [k, p] of Object.entries(tidied))
    positions[k] = { x: p.x + dxPct, y: p.y + dyPct };

  // Downward is the one direction with give: the caller grows the canvas to whatever
  // comes back rather than pulling the cluster up over its neighbours.
  const bottom = rect.y + dy + rect.height + BOTTOM_MARGIN;
  return { positions, minHeight: bottom > svgSize.h ? Math.ceil(bottom) : 0 };
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
  ...COMPLEMENT_TYPES.map((t) => COMPLEMENT_LABELS[t]),
];

// Tidy the whole period: tidy each dotted box on its own — exactly as its own tidy button
// does — then pack the tidied boxes into non-overlapping rows in reading order: subject ·
// verb phrase · direct object · complements. Boxes keep whatever
// collapse state they were in; a box is packed at the footprint it really renders at, so
// an expanded box gets the room its satellites need.
//
// Returns the new positions for every packed group's node, plus the canvas height the
// stack needs when it comes out taller than the canvas (0 when it fits).
export function packPeriod(
  groupRects: GroupRect[],
  svgSize: CanvasSize,
  sizeOf: SizeFn,
): { positions: PositionMap; minHeight: number } {
  const rank = (label: string) => {
    const i = READING_ORDER.indexOf(label);
    return i === -1 ? READING_ORDER.length : i;
  };
  const boxes = [...groupRects].sort((a, b) => rank(a.label) - rank(b.label));

  // Tidy each box around the origin first, purely to measure it: the rect that comes back
  // is the tidied box's footprint, and its (negative) x/y are the corner's offset from the
  // cluster center — which is what lets us re-center the cluster on any corner we pick.
  const laid = boxes.map((g) => {
    const local = tidyGroupPositions(g.nodeKeys, { x: 0, y: 0 }, svgSize, sizeOf);
    return { group: g, rect: rawGroupRect(g, (k) => local[k], svgSize, false, sizeOf) };
  });

  const gap = 20; // gutter between boxes, px
  const margin = 6;
  const { w: svgW, h: svgH } = svgSize;

  // Fill each row until the next box would overhang the canvas; a box wider than the
  // canvas on its own still gets a row to itself rather than an empty one above it.
  const maxRowW = Math.max(svgW - 2 * margin, 1);
  const rows: (typeof laid)[] = [];
  let row: typeof laid = [];
  let rowW = 0;
  for (const item of laid) {
    if (row.length && rowW + gap + item.rect.width > maxRowW) {
      rows.push(row);
      row = [];
      rowW = 0;
    }
    rowW += (row.length ? gap : 0) + item.rect.width;
    row.push(item);
  }
  if (row.length) rows.push(row);

  const rowHeights = rows.map((r) => Math.max(...r.map((i) => i.rect.height)));
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);

  const positions: PositionMap = {};
  // Center the whole stack vertically; center each row horizontally, and each box on its
  // row's baseline-agnostic middle so short boxes don't hang off a tall neighbour's top.
  const stackTop = Math.max(margin, (svgH - totalH) / 2);
  let boxTop = stackTop;
  rows.forEach((r, i) => {
    const width = r.reduce((s, it) => s + it.rect.width, 0) + gap * (r.length - 1);
    let boxLeft = Math.max(margin, (svgW - width) / 2);
    for (const { group, rect } of r) {
      const top = boxTop + (rowHeights[i] - rect.height) / 2;
      // Shift the measured cluster so its dotted box's corner lands on (boxLeft, top).
      const center = { x: boxLeft - rect.x, y: top - rect.y };
      Object.assign(
        positions,
        tidyGroupPositions(group.nodeKeys, center, svgSize, sizeOf),
      );
      boxLeft += rect.width + gap;
    }
    boxTop += rowHeights[i] + gap;
  });

  // Downward is the one direction with give, as when tidying a single box: the caller
  // grows the container rather than the stack being squashed into a canvas too short for it.
  const bottom = stackTop + totalH + BOTTOM_MARGIN;
  return { positions, minHeight: bottom > svgH ? Math.ceil(bottom) : 0 };
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
