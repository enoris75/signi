import type { NounKey } from "../interfaces.ts";
import { chainKeys, chainPortKey, type HostedRingGroup } from "../conjunctChain.ts";
import { ownerPortKey, type OwnerSpot } from "../ownerChain.ts";
import type { StandardSpot } from "../standardRing.ts";
import type { ExamplesSpot } from "../examplesRing.ts";
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
  reportRings,
  onAddConjunct,
  ownerQuestion,
}: {
  hosting: Hosting;
  chains: readonly { which: NounKey; count: number }[];
  wordPos: (key: string) => Pt;
  centerOf: (key: string) => Pt;
  possessorToward: (key: string) => Pt | undefined;
  reportRings: (hostKey: string, group: HostedRingGroup | null) => void;
  onAddConjunct: (which: NounKey) => void;
  // The *whose* an owner's ring carries, where its period offers one (P09-E52).
  ownerQuestion?: (spot: OwnerSpot) => RingHost["question"];
}): {
  conjunctHost: (which: NounKey, i: number) => RingHost;
  ownerHost: (spot: OwnerSpot) => RingHost;
  standardHost: (spot: StandardSpot) => RingHost;
  examplesHost: (spot: ExamplesSpot) => RingHost;
  instrumentHost: (first: string, instrument: NonNullable<RingHost["instrument"]>) => RingHost;
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
      onRings: (group) => reportRings(key, group),
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
    onRings: (group) => reportRings(spot.address, group),
    question: ownerQuestion?.(spot),
  });

  // The predicate adjective's standard of comparison: an owner's hand-off, faded while its degree
  // takes none (P09-E12 D5), and named the comparison set on a superlative (P09-E51).
  const standardHost = (spot: StandardSpot): RingHost => ({
    ...ownerHost(spot),
    kind: "standard",
    dimmed: spot.dimmed,
    set: spot.set,
  });

  // A noun's examples (P09-E48): an owner's hand-off of their own kind.
  const examplesHost = (spot: ExamplesSpot): RingHost => ({ ...ownerHost(spot), kind: "examples" });

  // An instrument drawn inside the clause (P12): its builder draws a ring per constituent — a thing's
  // noun, or an act's verb and noun — each under `instrumentKey(its word)`, placed where the canvas
  // puts it, and reports them all at once.
  const instrumentHost = (first: string, instrument: NonNullable<RingHost["instrument"]>): RingHost => ({
    ...hosting,
    kind: "instrument",
    key: INSTRUMENT,
    role: "subject",
    at: wordPos(instrumentKey(first)),
    keyOf: instrumentKey,
    atOf: (mainKey) => wordPos(instrumentKey(mainKey)),
    ports: [],
    onRings: (group) => reportRings(INSTRUMENT, group),
    instrument,
  });

  return { conjunctHost, ownerHost, standardHost, examplesHost, instrumentHost };
}

/** The node key an instrument drawn inside its clause goes by there, and each of its rings' (P12). */
export const INSTRUMENT = "instrumental";
export const instrumentKey = (mainKey: string) => `${INSTRUMENT}|${mainKey}`;
export const isInstrumentKey = (key: string) => key.startsWith(`${INSTRUMENT}|`);
