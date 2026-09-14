import type { NounKey } from "../interfaces.ts";
import { chainKeys } from "../conjunctChain.ts";
import { COMPACT_PAD_H, COMPACT_PAD_V } from "../layout.ts";
import { BUTTON_HALF, innerRadius } from "../ringLayout.ts";
import type { OwnerSpot } from "../ownerChain.ts";
import type { SizeFn } from "../graph.ts";

/**
 * What compact view packs, and how big a cell it packs each ring into.
 *
 * The keys are the rendered core words in reading order (in compact, satellites are already filtered
 * out), a coordinated noun's conjuncts straight after it, and each ring's owners straight after that
 * ring, however deep. Each cell is big enough for the biggest solid ring on the canvas — its own
 * constituents' and the hosted ones' — and the clear button straddling it.
 */
export function compactPacking({
  renderedSlots,
  chains,
  owners,
  groups,
  sizeOf,
  hostedRings,
}: {
  renderedSlots: readonly { key: string }[];
  chains: readonly { which: NounKey; count: number }[];
  owners: readonly Pick<OwnerSpot, "address" | "possessedKey">[];
  // The canvas's own constituents, whose solid ring is sized from their word.
  groups: readonly { mainKey: string }[];
  sizeOf: SizeFn;
  hostedRings: Readonly<Record<string, { rIn: number }>>;
}): { keys: string[]; cell: { halfW: number; halfH: number } } {
  const withOwners = (key: string): string[] => [
    key,
    ...owners.filter((o) => o.possessedKey === key).flatMap((o) => withOwners(o.address)),
  ];
  const keys = renderedSlots.flatMap((s) => {
    const chain = chains.find((c) => c.which === s.key);
    return (chain ? chainKeys(chain.which, chain.count) : [s.key]).flatMap(withOwners);
  });
  const ringHalf =
    Math.max(
      0,
      ...groups.map((g) => innerRadius(sizeOf(g.mainKey))),
      ...keys.map((k) => hostedRings[k]?.rIn ?? 0),
    ) + BUTTON_HALF;
  return {
    keys,
    cell: {
      halfW: Math.max(COMPACT_PAD_H, Math.ceil(ringHalf)),
      halfH: Math.max(COMPACT_PAD_V, Math.ceil(ringHalf)),
    },
  };
}
