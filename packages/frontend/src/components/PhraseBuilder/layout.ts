import { COMPLEMENT_LABELS, COMPLEMENT_TYPES } from "@signi/shared";
import type { GroupRect } from "./graph.ts";
import { BOTTOM_MARGIN } from "./overlap.ts";
import { CONJUNCT_GAP } from "./conjunctChain.ts";

// Node positions on the canvas, in % of the canvas box, keyed by node key.
export type PositionMap = Record<string, { x: number; y: number }>;

export type CanvasSize = { w: number; h: number };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Compact view packs each word into a cell this many px either side of its centre — unless the
// caller asks for a bigger cell to fit the solid rings on its canvas.
export const COMPACT_PAD_H = 66;
export const COMPACT_PAD_V = 30;

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

// Reading order for the tidied period; constituents with a label not listed sort to the end.
const READING_ORDER = [
  // P09-E47's interjection, spoken before the clause.
  "Interjection",
  "Subject",
  "Verb Phrase",
  "Direct Object",
  ...COMPLEMENT_TYPES.map((t) => COMPLEMENT_LABELS[t]),
];

// Tidy the whole period: pack the constituents' rings into non-overlapping, centred rows in
// reading order — interjection · subject · verb phrase · direct object · complements. A ring's satellites are
// always seated on its orbit, so there is nothing to tidy inside one: each constituent is packed at
// the footprint it really renders at, so an expanded one gets the room its satellites need.
//
// Returns the new position of every packed constituent's word (its satellites follow it), plus
// the canvas height the stack wants: the caller sizes the container to it, growing *or* shrinking,
// so tidying never strands a band of empty space under the grid. The positions are expressed
// against the canvas's current height: resizing rebases them onto the new one (rescaleYForHeight)
// holding each word's pixel offset, which is where the grid was laid out.
export function packPeriod(
  groupRects: GroupRect[],
  svgSize: CanvasSize,
): { positions: PositionMap; height: number } {
  const rank = (label: string) => {
    const i = READING_ORDER.indexOf(label);
    return i === -1 ? READING_ORDER.length : i;
  };
  // A conjunct's ring reads straight after the rings before it in its group: "the cat or the dog".
  // An owner's reads straight after the ring it owns, and a standard of comparison after the
  // predicate adjective it is compared with ("bigger than the dog").
  const order = (g: GroupRect) => {
    const hosted = g.conjunct ?? g.owner ?? g.standard;
    return hosted ? rank(hosted.head) + (hosted.index + 1) / 100 : rank(g.label);
  };
  const boxes = [...groupRects].sort((a, b) => order(a) - order(b));

  const gap = 20; // gutter between footprints, px
  const margin = 6;
  // The gutter before a box: a conjunct's is wide enough for the conjunction chip on its link, and an
  // owner's and a standard's match it.
  const gapBefore = (box: GroupRect) => (box.conjunct || box.owner || box.standard ? CONJUNCT_GAP : gap);
  const { w: svgW } = svgSize;

  // Fill each row until the next footprint would overhang the canvas; one wider than the canvas
  // on its own still gets a row to itself rather than an empty one above it.
  const maxRowW = Math.max(svgW - 2 * margin, 1);
  const rows: GroupRect[][] = [];
  let row: GroupRect[] = [];
  let rowW = 0;
  for (const box of boxes) {
    if (row.length && rowW + gapBefore(box) + box.width > maxRowW) {
      rows.push(row);
      row = [];
      rowW = 0;
    }
    rowW += (row.length ? gapBefore(box) : 0) + box.width;
    row.push(box);
  }
  if (row.length) rows.push(row);

  const rowHeights = rows.map((r) => Math.max(...r.map((b) => b.height)));
  const totalH = rowHeights.reduce((a, b) => a + b, 0) + gap * (rows.length - 1);
  // Hang the stack from the top of the canvas rather than centring it in the height the canvas
  // happens to have: the caller trims the container down to the stack.
  const stackTop = margin;
  const height = Math.ceil(stackTop + totalH + BOTTOM_MARGIN);

  const positions: PositionMap = {};
  let rowTop = stackTop;
  rows.forEach((r, i) => {
    const width = r.reduce((s, b, j) => s + b.width + (j ? gapBefore(b) : 0), 0);
    let left = Math.max(margin, (svgW - width) / 2);
    const middle = rowTop + rowHeights[i] / 2;
    r.forEach((box, j) => {
      if (j) left += gapBefore(box);
      positions[box.mainKey] = {
        x: ((left + box.width / 2) / Math.max(svgW, 1)) * 100,
        y: (middle / Math.max(svgSize.h, 1)) * 100,
      };
      left += box.width;
    });
    rowTop += rowHeights[i] + gap;
  });

  return { positions, height };
}

// Compact-view layout: pack the visible core words into centered rows and size the canvas
// to just wrap them. The caller derives (rather than stores) this each render, so it never
// goes stale on a resize and the full-view positions/height stay pristine.
//
// `corner` is how far the period's own controls, floated over the canvas's top-right corner in
// compact view, reach into the canvas: `w` in from its right edge, `h` down from its top. The
// first row stops a gap short of them — shifted left, and holding fewer words if it must, since a
// word's clear button pokes out past its cell. When not even one word fits beside them, the
// whole grid starts below them instead.
//
// `cell` is how far each word's cell reaches either side of its centre: the default fits a
// one-word box, and the caller widens it to hold the biggest solid ring on its canvas.
export function computeCompactLayout(
  keys: string[],
  svgW: number,
  corner: { w: number; h: number } = { w: 0, h: 0 },
  cell: { halfW: number; halfH: number } = { halfW: COMPACT_PAD_H, halfH: COMPACT_PAD_V },
): { positions: PositionMap; height: number } {
  const boxW = 2 * cell.halfW;
  const rowH = 2 * cell.halfH;
  const gap = 16;
  const margin = 4;
  // How many cells fit across a span of `w` px.
  const fit = (w: number) => Math.floor((w + gap) / (boxW + gap));
  const perRow = Math.max(1, fit(svgW - 2 * margin));
  const firstRight = corner.w > 0 ? svgW - corner.w - gap : svgW - margin;
  const beside = Math.min(perRow, Math.max(0, fit(firstRight - margin)));
  const firstCount = beside || perRow;
  const rows: string[][] = [];
  if (keys.length > 0) rows.push(keys.slice(0, firstCount));
  for (let i = firstCount; i < keys.length; i += perRow) rows.push(keys.slice(i, i + perRow));
  const gridTop = beside ? margin : margin + corner.h + gap / 2;
  const height = Math.max(
    rowH,
    Math.round(gridTop + rows.length * rowH + gap * Math.max(rows.length - 1, 0) + margin),
  );
  const positions: PositionMap = {};
  let top = gridTop;
  for (const [r, row] of rows.entries()) {
    const rowW = row.length * boxW + gap * (row.length - 1);
    const right = r === 0 && beside ? firstRight : svgW - margin;
    let left = Math.max(margin, Math.min((svgW - rowW) / 2, right - rowW));
    for (const key of row) {
      positions[key] = {
        x: ((left + cell.halfW) / Math.max(svgW, 1)) * 100,
        y: ((top + cell.halfH) / Math.max(height, 1)) * 100,
      };
      left += boxW + gap;
    }
    top += rowH + gap;
  }
  return { positions, height };
}
