import type { NounKey } from "../interfaces.ts";
import { DEFAULT_POSITIONS } from "../slots.ts";
import type { PositionMap, CanvasSize } from "../layout.ts";
import type { Pt } from "../ringLayout.ts";
import { belowRing, chainKeys, UNMEASURED_R, type HostedRing } from "../conjunctChain.ts";
import { besideRing, type OwnerSpot, type RingAt } from "../ownerChain.ts";

/**
 * Where each word sits on a canvas. A word is the centre of its constituent's rings; everything
 * else on the constituent is placed round it.
 *
 * `wordPos` answers in % of the canvas: the place a host handed a hosted ring's builder, else the
 * compact packing while compact, else the stored position, else the word's default — and a hosted
 * ring not placed yet starts where it will be seeded (see seedHostedPositions): a conjunct's straight
 * below the ring before it in its group, an owner's below and beside the ring it owns. `centerOf`
 * answers the same in px.
 */
export function wordPlacement({
  at,
  compactPositions,
  positions,
  graphSize,
  chains,
  owners,
}: {
  // Where a host paints a hosted ring's one word (see RingHost.at).
  at: Pt | undefined;
  compactPositions: PositionMap | undefined;
  positions: PositionMap;
  graphSize: CanvasSize;
  chains: readonly { which: NounKey; count: number }[];
  owners: readonly Pick<OwnerSpot, "address" | "possessedKey">[];
}): { wordPos: (key: string) => Pt; centerOf: (key: string) => Pt } {
  const wordPos = (key: string): Pt =>
    at ?? compactPositions?.[key] ?? positions[key] ?? DEFAULT_POSITIONS[key] ?? unplacedRing(key);

  const centerOf = (key: string): Pt => {
    const p = wordPos(key);
    return { x: (p.x / 100) * graphSize.w, y: (p.y / 100) * graphSize.h };
  };

  function unplacedRing(key: string): Pt {
    const percent = (c: Pt) => ({
      x: (c.x / Math.max(graphSize.w, 1)) * 100,
      y: (c.y / Math.max(graphSize.h, 1)) * 100,
    });
    for (const { which, count } of chains) {
      const keys = chainKeys(which, count);
      const i = keys.indexOf(key);
      if (i < 1) continue;
      return percent(belowRing(centerOf(keys[i - 1]), UNMEASURED_R));
    }
    const owner = owners.find((o) => o.address === key);
    if (owner) return percent(besideRing(centerOf(owner.possessedKey), UNMEASURED_R, graphSize.w));
    return { x: 50, y: 50 };
  }

  return { wordPos, centerOf };
}

/**
 * The rings and controls on a canvas once its own constituents are laid out.
 *
 * `ringOf` answers a ring by its key: one of the canvas's own constituents', or a hosted one's as
 * its builder reported it. `controlOn` answers where a control on a ring sits: seated here for the
 * canvas's own constituents, or at the offset a hosted ring reported — under `hostedControl`, the key
 * its own builder knows the control by.
 */
export function ringLookup({
  groupRects,
  hostedRings,
  controlPos,
  centerOf,
}: {
  groupRects: readonly (RingAt & { mainKey: string })[];
  hostedRings: Readonly<Record<string, HostedRing>>;
  controlPos: Readonly<Record<string, Pt>>;
  centerOf: (key: string) => Pt;
}): {
  ringOf: (key: string) => RingAt | undefined;
  controlOn: (key: string, control: string, hostedControl?: string) => Pt | undefined;
} {
  const ringOf = (key: string): RingAt | undefined => {
    const group = groupRects.find((g) => g.mainKey === key);
    if (group) return group;
    const ring = hostedRings[key];
    return ring && { center: centerOf(key), rIn: ring.rIn, rOut: ring.rOut };
  };

  const controlOn = (key: string, control: string, hostedControl: string = control): Pt | undefined => {
    const at = controlPos[control];
    if (at) return at;
    const offset = hostedRings[key]?.ports[hostedControl];
    if (!offset) return undefined;
    const c = centerOf(key);
    return { x: c.x + offset.x, y: c.y + offset.y };
  };

  return { ringOf, controlOn };
}
