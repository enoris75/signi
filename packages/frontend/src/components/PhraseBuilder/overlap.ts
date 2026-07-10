import { rawGroupRect, type GroupRect, type SizeFn } from "./graph.ts";
import type { CanvasSize, PositionMap } from "./layout.ts";

// Keeps the dotted role boxes from ever covering one another. A box's footprint is derived
// from its child nodes, so it grows whenever a satellite is revealed, an adjective is added,
// a group is expanded, or a node is dragged out of the cluster — and nothing about that
// derivation stops the new footprint landing on top of a neighbour. This module takes the
// freshly measured rects and works out how far each box has to slide to be clear again.
//
// A box never gives up any of its footprint to make room: a shove stops dead at the canvas
// wall, and a pair that can't fit side by side is separated top-to-bottom instead. Downward
// is the one direction that can always absorb a shove, because the caller grows the canvas
// to whatever height comes back.

// Clear space left between two separated boxes, in canvas px.
const GAP = 10;
// Relaxation passes. Each pass separates every overlapping pair once, so a shove that
// pushes a box into a third box is cleaned up on the next pass. A period holds a handful
// of boxes, so this converges long before the cap.
const PASSES = 16;
// Shifts below this (% of the canvas) aren't worth a re-render.
const EPS_PCT = 0.05;
// A shove smaller than this (px) counts as no movement at all — it stops a pair wedged
// against a wall from reporting progress forever.
const EPS_PX = 0.01;
// Clear space left below the lowest box when the canvas is sized to hold it.
export const BOTTOM_MARGIN = 8;

// How hard a box resists being pushed. The box under the pointer never yields; a box that
// just grew or just appeared yields only to that one; everything else is free to be shoved.
// Two boxes of equal rank split the shove evenly, which guarantees every overlapping pair
// makes progress — otherwise two boxes that grew in the same commit would deadlock.
type Rank = 0 | 1 | 2;
export const RANK_FREE: Rank = 0;
export const RANK_GROWN: Rank = 1;
export const RANK_DRAGGED: Rank = 2;

export type Separation = {
  positions: PositionMap;
  // The canvas height, in px, needed to hold the boxes that were pushed down past the
  // bottom edge; 0 when the separation fit inside the canvas as it stands. Only ever
  // asks for more room than there is — separating boxes never shrinks the canvas.
  minHeight: number;
};

// How far a box spanning [lo, lo + len] can travel toward `dir` before its leading edge
// leaves the [0, extent] canvas. A box that already overhangs that edge — a cluster wider
// than the canvas, or one the user dragged half out of view — has no room at all on that
// side: it holds still, and its neighbour absorbs the whole separation instead.
function room(lo: number, len: number, extent: number, dir: -1 | 1): number {
  return dir < 0 ? Math.max(0, lo) : Math.max(0, extent - (lo + len));
}

// Split a `need` px separation between the two boxes of a pair. Each takes its rank's
// share, and whatever a box can't take — because it would slide off the canvas, or because
// it outranks the pair and yields nothing — passes to the other. Null when even both of
// them travelling as far as they may leaves the pair overlapping; the caller then tries
// the other direction, and failing that the other axis.
function allocate(
  need: number,
  shareA: number,
  shareB: number,
  capA: number,
  capB: number,
): [number, number] | null {
  let a = need * shareA;
  let b = need * shareB;
  if (a > capA) {
    b += a - capA;
    a = capA;
  }
  if (b > capB) {
    a = Math.min(capA, a + (b - capB));
    b = capB;
  }
  return a + b >= need - EPS_PX ? [a, b] : null;
}

// Separate every overlapping pair of dotted boxes, pushing each along whichever axis needs
// the shorter travel — aside when they sit side by side, down when they sit one above the
// other. Returns the new positions of the moved boxes' nodes (plus any extra canvas height
// the downward shoves need), or null when the boxes are already clear of each other — the
// common case, which is what lets the caller run this after every commit without looping.
export function resolveGroupOverlaps({
  groupRects,
  pos,
  sizeOf,
  svgSize,
  rankOf,
}: {
  groupRects: GroupRect[];
  pos: (key: string) => { x: number; y: number };
  sizeOf: SizeFn;
  svgSize: CanvasSize;
  rankOf: (group: GroupRect) => Rank;
}): Separation | null {
  if (groupRects.length < 2) return null;

  const boxes = groupRects.map((g) => ({
    group: g,
    // Raw, unclipped footprints — see rawGroupRect.
    rect: rawGroupRect(g, pos, svgSize, false, sizeOf),
    rank: rankOf(g),
    dx: 0,
    dy: 0,
  }));
  type Box = (typeof boxes)[number];
  // A resolution of one pair: b travels `db` px along `dir`, a travels `da` px against it.
  type Move = { dir: -1 | 1; da: number; db: number };

  for (let pass = 0; pass < PASSES; pass++) {
    let moved = false;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        // Half the combined span on each axis, and how far b's centre sits from a's.
        // Clearing the pair along an axis means opening `half + GAP` between the centres.
        const halfX = (a.rect.width + b.rect.width) / 2;
        const halfY = (a.rect.height + b.rect.height) / 2;
        const dcx =
          b.rect.x + b.dx + b.rect.width / 2 - (a.rect.x + a.dx + a.rect.width / 2);
        const dcy =
          b.rect.y + b.dy + b.rect.height / 2 - (a.rect.y + a.dy + a.rect.height / 2);
        // How deep they interpenetrate on each axis, counting the gap as solid.
        const penX = halfX + GAP - Math.abs(dcx);
        const penY = halfY + GAP - Math.abs(dcy);
        if (penX <= 0 || penY <= 0) continue; // already clear on one axis

        // The shove b takes, and its mirror image for a: 1/0 when one outranks the
        // other, half each when they're equals.
        const shareB = a.rank > b.rank ? 1 : a.rank < b.rank ? 0 : 0.5;
        const shareA = 1 - shareB;
        // A box that yields nothing to this pair — the one under the pointer — refuses to
        // absorb what its neighbour can't take either: zero capacity, whatever the walls
        // say. Otherwise a neighbour wedged against a wall would shove the user's own box
        // back out from under the pointer.
        const capX = (box: Box, share: number, dir: -1 | 1) =>
          share === 0
            ? 0
            : room(box.rect.x + box.dx, box.rect.width, svgSize.w, dir);
        // Downward is unbounded — the canvas grows to fit. That is what makes a vertical
        // separation always available, and so the fallback when sideways won't fit.
        const capY = (box: Box, share: number, dir: -1 | 1) =>
          share === 0 ? 0 : dir > 0 ? Infinity : Math.max(0, box.rect.y + box.dy);

        // Separate the pair along one axis, each box sliding away from the other to the
        // side it already leans to. `flip` retries with the pair swapped end for end, so a
        // box pinned against an edge is carried past its neighbour rather than driven off
        // the canvas; the extra distance back across the neighbour is priced into `need`.
        const separate = (
          half: number,
          dc: number,
          cap: (box: Box, share: number, dir: -1 | 1) => number,
          flip: boolean,
        ): Move | null => {
          // Concentric boxes lean nowhere, so send whichever of the two does most of the
          // moving down (or right), which reads better than lifting it off the top edge.
          const lean: -1 | 1 = dc > 0 ? 1 : dc < 0 ? -1 : shareA >= shareB ? -1 : 1;
          for (const dir of flip ? [lean, -lean as -1 | 1] : [lean]) {
            const alloc = allocate(
              half + GAP - dir * dc,
              shareA,
              shareB,
              cap(a, shareA, -dir as -1 | 1),
              cap(b, shareB, dir),
            );
            if (alloc) return { dir, da: alloc[0], db: alloc[1] };
          }
          return null;
        };

        // Aside is preferred when they're less deeply interlocked that way — but only if
        // the pair can actually clear each other without a box being driven off the canvas.
        // A period whose boxes fill the width has no room left to move "aside", so those
        // take the trip down instead, and the canvas grows to suit. Aside never carries a
        // box the long way round past its neighbour: down is the answer when sideways is
        // full. Down itself can't run out, but up can, so the vertical pass may flip.
        const aside = penX < penY ? separate(halfX, dcx, capX, false) : null;
        const move = aside ?? separate(halfY, dcy, capY, true);
        // Both boxes pinned: only possible when neither will yield, so leave the pair be.
        if (!move || move.da + move.db < EPS_PX) continue;
        moved = true;
        if (aside) {
          a.dx -= move.da * move.dir;
          b.dx += move.db * move.dir;
        } else {
          a.dy -= move.da * move.dir;
          b.dy += move.db * move.dir;
        }
      }
    }
    if (!moved) break;
  }

  // Translate each box's pixel shift back onto its nodes. The shifts are already fenced in
  // by the canvas walls, so this needs no clamp of its own — and because the fence is
  // applied per box rather than per node, a box that runs out of room slides as far as it
  // can and keeps its shape instead of shearing.
  const positions: PositionMap = {};
  let bottom = 0;
  let changed = false;
  for (const b of boxes) {
    if (b.dx === 0 && b.dy === 0) continue;
    const dxPct = (b.dx / Math.max(svgSize.w, 1)) * 100;
    const dyPct = (b.dy / Math.max(svgSize.h, 1)) * 100;
    if (Math.abs(dxPct) < EPS_PCT && Math.abs(dyPct) < EPS_PCT) continue;
    changed = true;
    // Only a box actually sent downward may ask for a taller canvas; one that already
    // overhung the bottom edge stays as the user left it.
    if (b.dy > 0) bottom = Math.max(bottom, b.rect.y + b.dy + b.rect.height);
    for (const k of b.group.nodeKeys) {
      const p = pos(k);
      positions[k] = { x: p.x + dxPct, y: p.y + dyPct };
    }
  }
  if (!changed) return null;
  return {
    positions,
    minHeight: bottom > svgSize.h ? Math.ceil(bottom + BOTTOM_MARGIN) : 0,
  };
}
