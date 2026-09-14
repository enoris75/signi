import type { NounKey } from "../interfaces.ts";
import { DEFAULT_POSITIONS } from "../slots.ts";
import type { CanvasSize, PositionMap } from "../layout.ts";
import { BUTTON_HALF, toPercent, toPx, type Pt } from "../ringLayout.ts";
import { BOTTOM_MARGIN } from "../overlap.ts";
import { belowRing, chainKeys, UNMEASURED_R } from "../conjunctChain.ts";
import { besideRing, type OwnerSpot } from "../ownerChain.ts";

/**
 * Where each hosted ring without a stored position is first put: a conjunct's straight below the ring
 * before it in its group, an owner's below and beside the ring it owns, a chip's length clear. A ring
 * is seeded from a ring seeded in the same pass, so a whole new chain lands in one go.
 *
 * Seeds are in % of the full-view canvas, whatever compact view shows, so a ring always has somewhere
 * to be dragged from. `bottom` is how far down, in px, the seeded rings reach (0 when none is seeded):
 * past the canvas's height, the canvas has to grow to hold them.
 */
export function seedHostedPositions({
  chains,
  owners,
  positions,
  groupRects,
  hostedRings,
  canvas,
}: {
  chains: readonly { which: NounKey; count: number }[];
  // Parents first (see possessionsFor), so the ring an owner is placed beside has a place already.
  owners: readonly Pick<OwnerSpot, "address" | "possessedKey">[];
  // The stored (full-view) positions.
  positions: PositionMap;
  // How far each ring reaches: the canvas's own constituents', and the hosted rings' as reported.
  groupRects: readonly { mainKey: string; rOut: number }[];
  hostedRings: Readonly<Record<string, { rOut: number }>>;
  // The full-view canvas: its measured width and its stored height.
  canvas: CanvasSize;
}): { seeds: PositionMap; bottom: number } {
  const seeds: PositionMap = {};
  let bottom = 0;
  const placed = (key: string) => seeds[key] ?? positions[key] ?? DEFAULT_POSITIONS[key];
  const rOutOf = (key: string) =>
    groupRects.find((g) => g.mainKey === key)?.rOut ?? hostedRings[key]?.rOut ?? UNMEASURED_R;
  const px = (p: Pt) => toPx(p, canvas);
  const seed = (key: string, c: Pt) => {
    seeds[key] = toPercent(c, canvas);
    bottom = Math.max(bottom, c.y + UNMEASURED_R + BUTTON_HALF + BOTTOM_MARGIN);
  };

  for (const { which, count } of chains) {
    const keys = chainKeys(which, count);
    for (let i = 1; i < keys.length; i++) {
      const key = keys[i];
      if (positions[key]) continue;
      const p = placed(keys[i - 1]);
      if (!p) continue;
      seed(key, belowRing(px(p), rOutOf(keys[i - 1])));
    }
  }
  for (const spot of owners) {
    if (positions[spot.address]) continue;
    const p = placed(spot.possessedKey);
    if (!p) continue;
    seed(spot.address, besideRing(px(p), rOutOf(spot.possessedKey), canvas.w));
  }
  return { seeds, bottom };
}
