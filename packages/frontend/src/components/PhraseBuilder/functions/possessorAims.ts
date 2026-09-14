import { pointerBend, type OwnerSpot, type PointerSpot } from "../ownerChain.ts";
import type { Pt } from "../ringLayout.ts";

/**
 * Where each noun's possessor control faces while the noun has an owner: the owner's ring, or the
 * bend of the line to the noun it points to — while that noun's ring is on the canvas. The line to
 * the owner leaves from the control.
 *
 * `toward` answers for any ring's key; `byGroup` holds the answers for the canvas's own constituents,
 * leaving out those with no owner to face.
 */
export function possessorAims({
  owners,
  pointers,
  groups,
  hostedRings,
  centerOf,
}: {
  owners: readonly Pick<OwnerSpot, "address" | "possessedKey">[];
  pointers: readonly Pick<PointerSpot, "possessedKey" | "antecedentKey">[];
  groups: readonly { mainKey: string }[];
  hostedRings: Readonly<Record<string, unknown>>;
  centerOf: (key: string) => Pt;
}): { toward: (key: string) => Pt | undefined; byGroup: Record<string, Pt> } {
  const toward = (key: string): Pt | undefined => {
    const owner = owners.find((o) => o.possessedKey === key);
    if (owner) return centerOf(owner.address);
    const target = pointers.find((p) => p.possessedKey === key)?.antecedentKey;
    return target && (groups.some((g) => g.mainKey === target) || hostedRings[target])
      ? pointerBend(centerOf(key), centerOf(target))
      : undefined;
  };
  const byGroup = Object.fromEntries(
    groups.flatMap((g) => {
      const at = toward(g.mainKey);
      return at ? [[g.mainKey, at]] : [];
    }),
  );
  return { toward, byGroup };
}
