import type { NounKey } from "../interfaces.ts";
import { conjunctKey, hostedRect, type HostedRing } from "../conjunctChain.ts";
import type { OwnerSpot } from "../ownerChain.ts";
import type { StandardSpot } from "../standardRing.ts";
import type { GroupRect } from "../graph.ts";
import type { Pt } from "../ringLayout.ts";

/**
 * The hosted rings on a canvas as constituents of it — kept clear of the others, and packed by a
 * tidy — once each one's builder has reported drawing it. A ring wears the colour of the period noun
 * it belongs with, and is left out while that noun has no ring here.
 *
 * `standIns` maps each coordinated noun's group label to its conjuncts' rings, which stand in for it
 * in compact view.
 */
export function hostedRectsFor({
  chains,
  owners,
  standard,
  groupRects,
  hostedRings,
  centerOf,
  compact,
}: {
  chains: readonly { which: NounKey; count: number }[];
  owners: readonly OwnerSpot[];
  // The predicate adjective's standard of comparison, when its ring is drawn (P09-E12 D5).
  standard?: StandardSpot;
  groupRects: readonly GroupRect[];
  hostedRings: Readonly<Record<string, HostedRing>>;
  centerOf: (key: string) => Pt;
  compact: boolean;
}): {
  conjunctRects: GroupRect[];
  ownerRects: GroupRect[];
  standardRects: GroupRect[];
  standIns: Record<string, GroupRect[]>;
} {
  const headOf = (which: NounKey) => groupRects.find((g) => g.mainKey === which);

  const conjunctRects = chains.flatMap(({ which, count }) => {
    const head = headOf(which);
    if (!head) return [];
    return Array.from({ length: count }, (_, i) => conjunctKey(which, i)).flatMap((key, i) => {
      const ring = hostedRings[key];
      if (!ring) return [];
      return [hostedRect({ key, color: head.color, kind: "conjunct", head: head.label, index: i, center: centerOf(key), ring, compact })];
    });
  });

  const spotRect = (spot: OwnerSpot, kind: "owner" | "standard"): GroupRect[] => {
    const ring = hostedRings[spot.address];
    const head = headOf(spot.role);
    if (!ring || !head) return [];
    return [
      hostedRect({
        key: spot.address,
        color: head.color,
        kind,
        head: head.label,
        index: spot.order,
        center: centerOf(spot.address),
        ring,
        compact,
      }),
    ];
  };
  const ownerRects = owners.flatMap((spot) => spotRect(spot, "owner"));
  const standardRects = standard ? spotRect(standard, "standard") : [];

  const standIns = Object.fromEntries(
    chains.flatMap(({ which }) => {
      const head = headOf(which);
      return head ? [[head.label, conjunctRects.filter((r) => r.conjunct?.head === head.label)]] : [];
    }),
  );

  return { conjunctRects, ownerRects, standardRects, standIns };
}
