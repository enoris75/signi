import { rawGroupRect, type GroupRect } from "./graph.ts";
import type { CanvasSize, PositionMap } from "./layout.ts";

// Keeps the dotted role boxes from ever covering one another. A box's footprint is derived
// from its child nodes, so it grows whenever a satellite is revealed, an adjective is added,
// a group is expanded, or a node is dragged out of the cluster — and nothing about that
// derivation stops the new footprint landing on top of a neighbour. This module takes the
// freshly measured rects and works out how far each box has to slide to be clear again.

// Clear space left between two separated boxes, in canvas px.
const GAP = 10;
// Relaxation passes. Each pass separates every overlapping pair once, so a shove that
// pushes a box into a third box is cleaned up on the next pass. A period holds a handful
// of boxes, so this converges long before the cap — which is there to stop a trio wedged
// against the canvas edge from spinning.
const PASSES = 16;
// Node centres stay inside this band (% of the canvas), matching the drag clamp.
const MIN_PCT = 2;
const MAX_PCT = 98;
// Shifts below this (% of the canvas) aren't worth a re-render.
const EPS_PCT = 0.05;

// How hard a box resists being pushed. The box under the pointer never yields; a box that
// just grew or just appeared yields only to that one; everything else is free to be shoved.
// Two boxes of equal rank split the shove evenly, which guarantees every overlapping pair
// makes progress — otherwise two boxes that grew in the same commit would deadlock.
type Rank = 0 | 1 | 2;
export const RANK_FREE: Rank = 0;
export const RANK_GROWN: Rank = 1;
export const RANK_DRAGGED: Rank = 2;

// How much further off the canvas a shove of `d` px pushes a box spanning [lo, lo+len] on
// one axis. Measured as the *increase* in overhang, so a box that already sticks out (a
// wide cluster on a narrow canvas) isn't charged for standing still, only for sliding out
// further. Never negative on both ends at once, since a box longer than the canvas always
// overhangs somewhere.
function spill(lo: number, len: number, d: number, extent: number): number {
  const over = (at: number) =>
    Math.max(0, -at) + Math.max(0, at + len - extent);
  return Math.max(0, over(lo + d) - over(lo));
}

// The largest part of `shift` (in %) a group can take without carrying its outermost node
// past the canvas edge. A cluster already wider than the band has nowhere to go, so it
// stays put and its neighbour absorbs the whole separation on the next pass instead.
function clampShift(shift: number, lo: number, hi: number): number {
  const min = MIN_PCT - lo;
  const max = MAX_PCT - hi;
  if (min > max) return 0;
  return Math.max(min, Math.min(max, shift));
}

// Separate every overlapping pair of dotted boxes, pushing each along whichever axis needs
// the shorter travel — aside when they sit side by side, down when they sit one above the
// other. Returns the new positions of the moved boxes' nodes, or null when the boxes are
// already clear of each other (the common case, which is what lets the caller run this
// after every commit without looping).
export function resolveGroupOverlaps({
  groupRects,
  pos,
  svgSize,
  rankOf,
}: {
  groupRects: GroupRect[];
  pos: (key: string) => { x: number; y: number };
  svgSize: CanvasSize;
  rankOf: (group: GroupRect) => Rank;
}): PositionMap | null {
  if (groupRects.length < 2) return null;

  const boxes = groupRects.map((g) => ({
    group: g,
    // Raw, unclipped footprints — see rawGroupRect.
    rect: rawGroupRect(g, pos, svgSize, false),
    rank: rankOf(g),
    dx: 0,
    dy: 0,
  }));

  let anyOverlap = false;
  for (let pass = 0; pass < PASSES; pass++) {
    let moved = false;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const acx = a.rect.x + a.dx + a.rect.width / 2;
        const acy = a.rect.y + a.dy + a.rect.height / 2;
        const bcx = b.rect.x + b.dx + b.rect.width / 2;
        const bcy = b.rect.y + b.dy + b.rect.height / 2;
        // How deep they interpenetrate on each axis, counting the gap as solid.
        const penX =
          (a.rect.width + b.rect.width) / 2 + GAP - Math.abs(bcx - acx);
        const penY =
          (a.rect.height + b.rect.height) / 2 + GAP - Math.abs(bcy - acy);
        if (penX <= 0 || penY <= 0) continue; // already clear on one axis
        moved = true;
        anyOverlap = true;
        // The shove b takes, and its mirror image for a: 1/0 when one outranks the
        // other, half each when they're equals.
        const shareB = a.rank > b.rank ? 1 : a.rank < b.rank ? 0 : 0.5;
        const shareA = 1 - shareB;
        // Push apart along the axis they're least deeply interlocked on — aside when they
        // sit side by side, down when one is above the other. Concentric boxes have no
        // preferred direction, so send whichever of the two does most of the moving down
        // (or right), which reads better than lifting it off the top edge.
        const dirX = bcx > acx ? 1 : bcx < acx ? -1 : shareA >= shareB ? -1 : 1;
        const dirY = bcy > acy ? 1 : bcy < acy ? -1 : shareA >= shareB ? -1 : 1;
        const aDx = -penX * dirX * shareA;
        const bDx = penX * dirX * shareB;
        const aDy = -penY * dirY * shareA;
        const bDy = penY * dirY * shareB;
        // Shallower is only better if it doesn't shove a box off the canvas. A period
        // whose boxes fill the width has no room left to move "aside", and sliding one
        // out of sight is worse than the longer trip down.
        const spillX =
          spill(a.rect.x + a.dx, a.rect.width, aDx, svgSize.w) +
          spill(b.rect.x + b.dx, b.rect.width, bDx, svgSize.w);
        const spillY =
          spill(a.rect.y + a.dy, a.rect.height, aDy, svgSize.h) +
          spill(b.rect.y + b.dy, b.rect.height, bDy, svgSize.h);
        const useX = spillX !== spillY ? spillX < spillY : penX < penY;
        if (useX) {
          a.dx += aDx;
          b.dx += bDx;
        } else {
          a.dy += aDy;
          b.dy += bDy;
        }
      }
    }
    if (!moved) break;
  }
  if (!anyOverlap) return null;

  // Translate each box's pixel shift back onto its nodes, clamped so the cluster stays on
  // the canvas. The clamp is applied per group rather than per node, so a box that runs
  // out of room slides as far as it can and keeps its shape instead of shearing.
  const positions: PositionMap = {};
  let changed = false;
  for (const b of boxes) {
    if (b.dx === 0 && b.dy === 0) continue;
    const pts = b.group.nodeKeys.map((k) => pos(k));
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const dxPct = clampShift(
      (b.dx / Math.max(svgSize.w, 1)) * 100,
      Math.min(...xs),
      Math.max(...xs),
    );
    const dyPct = clampShift(
      (b.dy / Math.max(svgSize.h, 1)) * 100,
      Math.min(...ys),
      Math.max(...ys),
    );
    if (Math.abs(dxPct) < EPS_PCT && Math.abs(dyPct) < EPS_PCT) continue;
    changed = true;
    b.group.nodeKeys.forEach((k, i) => {
      positions[k] = { x: pts[i].x + dxPct, y: pts[i].y + dyPct };
    });
  }
  return changed ? positions : null;
}
