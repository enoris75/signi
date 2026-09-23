import type { NounKey } from "../interfaces.ts";
import { chainKeys, chainPortKey, type HostedRing } from "../conjunctChain.ts";
import { ownerPortKey, type OwnerSpot } from "../ownerChain.ts";
import type { StandardSpot } from "../standardRing.ts";
import type { Pt } from "../ringLayout.ts";
import type { RingHost } from "../ringHost.ts";

/** What every hosted ring borrows from the canvas it is drawn on alike. */
export type Hosting = Pick<
  RingHost,
  | "graphSize"
  | "compact"
  | "draggingKey"
  | "makeDragProps"
  | "makeGroupDragProps"
  | "nudge"
  | "ownersOpen"
  | "setOwnerOpen"
>;

/**
 * The hand-off from a canvas to each ring it hosts: where the ring's word sits, which rings its
 * ports face, where its possessor control aims, and how it reports the ring it drew.
 */
export function ringHosts({
  hosting,
  chains,
  wordPos,
  centerOf,
  possessorToward,
  reportRing,
  onAddConjunct,
}: {
  hosting: Hosting;
  chains: readonly { which: NounKey; count: number }[];
  wordPos: (key: string) => Pt;
  centerOf: (key: string) => Pt;
  possessorToward: (key: string) => Pt | undefined;
  reportRing: (key: string, ring: HostedRing | null) => void;
  onAddConjunct: (which: NounKey) => void;
}): {
  conjunctHost: (which: NounKey, i: number) => RingHost;
  ownerHost: (spot: OwnerSpot) => RingHost;
  standardHost: (spot: StandardSpot) => RingHost;
} {
  // Conjunct `i` of `which`: its ports face the rings either side of it in its group.
  const conjunctHost = (which: NounKey, i: number): RingHost => {
    const count = chains.find((c) => c.which === which)?.count ?? 0;
    const keys = chainKeys(which, count);
    const key = keys[i + 1];
    const neighbours = [keys[i], keys[i + 2]].filter((k): k is string => Boolean(k));
    return {
      ...hosting,
      kind: "conjunct",
      key,
      role: which,
      at: wordPos(key),
      ports: neighbours.map((n) => ({ key: chainPortKey(key, n), toward: centerOf(n) })),
      possessorToward: possessorToward(key),
      onRing: (ring) => reportRing(key, ring),
      isLast: i === count - 1,
      onAddConjunct: () => onAddConjunct(which),
    };
  };

  // An owner: its one port faces the ring it owns.
  const ownerHost = (spot: OwnerSpot): RingHost => ({
    ...hosting,
    kind: "owner",
    key: spot.address,
    role: spot.role,
    at: wordPos(spot.address),
    ports: [{ key: ownerPortKey(spot), toward: centerOf(spot.possessedKey) }],
    possessorToward: possessorToward(spot.address),
    onRing: (ring) => reportRing(spot.address, ring),
  });

  // The predicate adjective's standard of comparison: an owner's hand-off, faded while its degree
  // takes none (P09-E12 D5).
  const standardHost = (spot: StandardSpot): RingHost => ({
    ...ownerHost(spot),
    kind: "standard",
    dimmed: spot.dimmed,
  });

  return { conjunctHost, ownerHost, standardHost };
}
