import { describe, expect, it } from 'vitest';
import {
  BOTTOM_MARGIN,
  RANK_DRAGGED,
  RANK_FREE,
  resolveGroupOverlaps,
} from '../src/components/PhraseBuilder/overlap.ts';
import type { GroupRect } from '../src/components/PhraseBuilder/graph.ts';

// The resolver packs footprints — the square a dotted ring and its controls take up — so the ring
// geometry inside one plays no part in it, and is filled in here from the square.
const CANVAS = { w: 800, h: 400 };

function box(
  label: string,
  rect: { x: number; y: number; width: number; height: number },
): GroupRect {
  return {
    ...rect,
    label,
    color: '#000',
    mainKey: label,
    nodeKeys: [label],
    center: { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 },
    rIn: rect.width / 4,
    orbit: rect.width / 3,
    rOut: rect.width / 2,
  };
}

// A node's position is stored as a % of the canvas box, which is what the resolver reads and
// writes; these two convert a px offset to and from it.
const pctY = (px: number) => (px / CANVAS.h) * 100;
// Every node of a constituent has a position of its own; the satellites are seated relative to
// the word, and a shove carries all of them, so they all start where the word does here.
const positionsOf = (boxes: GroupRect[]) =>
  Object.fromEntries(
    boxes.flatMap((b) => b.nodeKeys.map((key) => [key, { x: pctY(b.x), y: pctY(b.y) }])),
  );

function resolve(boxes: GroupRect[], rank: (g: GroupRect) => -1 | 0 | 1 | 2 = () => RANK_FREE) {
  const stored = positionsOf(boxes);
  return resolveGroupOverlaps({
    groupRects: boxes,
    pos: (key) => stored[key]!,
    svgSize: CANVAS,
    rankOf: rank,
  });
}

describe('resolveGroupOverlaps', () => {
  it('leaves boxes that are on the canvas and clear of each other where they are', () => {
    const boxes = [
      box('Subject', { x: 20, y: 20, width: 200, height: 200 }),
      box('Direct Object', { x: 400, y: 20, width: 200, height: 200 }),
    ];
    expect(resolve(boxes)).toBeNull();
  });

  // A ring grows around its word in every direction, so a constituent that gains a determiner and
  // adjectives grows upward too — off the canvas, and over the period header, which is where the
  // tidy and save controls live. The wall is not a shove that can be fenced: it is where the
  // footprint was drawn, so the box has to be brought back to it.
  it('pulls a box that overhangs the top back down to the wall', () => {
    const lifted = box('Subject', { x: 20, y: -40, width: 200, height: 200 });
    const separated = resolve([lifted]);
    expect(separated).not.toBeNull();
    // Down by exactly the overhang: its top now sits on the canvas's top edge.
    expect(separated!.positions['Subject']!.y).toBeCloseTo(pctY(-40) + pctY(40), 6);
    expect(separated!.positions['Subject']!.x).toBeCloseTo(pctY(20), 6);
    // It still fits inside the canvas, so the canvas is not asked to grow.
    expect(separated!.minHeight).toBe(0);
  });

  it('carries every node of the box it pulls, not just the word', () => {
    const lifted = {
      ...box('Subject', { x: 20, y: -40, width: 200, height: 200 }),
      nodeKeys: ['Subject', 'subjectAdjective', 'subjectDefiniteness'],
    };
    const separated = resolve([lifted]);
    expect(Object.keys(separated!.positions).sort()).toEqual([
      'Subject',
      'subjectAdjective',
      'subjectDefiniteness',
    ]);
  });

  // Downward is the one direction that can always absorb travel, because the caller grows the
  // canvas to whatever height comes back — including when the travel is this pull.
  it('grows the canvas when the box it pulled down no longer fits', () => {
    const tall = box('Direct Object', { x: 20, y: -40, width: 200, height: 420 });
    const separated = resolve([tall]);
    expect(separated!.minHeight).toBe(420 + BOTTOM_MARGIN);
  });

  it('leaves the box under the pointer where the user is holding it', () => {
    const dragged = box('Subject', { x: 20, y: -40, width: 200, height: 200 });
    expect(resolve([dragged], () => RANK_DRAGGED)).toBeNull();
  });

  it('still separates two boxes that cover each other', () => {
    const boxes = [
      box('Subject', { x: 100, y: 100, width: 200, height: 200 }),
      box('Direct Object', { x: 150, y: 100, width: 200, height: 200 }),
    ];
    const separated = resolve(boxes);
    expect(separated).not.toBeNull();
    expect(Object.keys(separated!.positions).sort()).toEqual(['Direct Object', 'Subject']);
  });
});
