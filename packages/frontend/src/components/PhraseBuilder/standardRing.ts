// The standard of comparison on a canvas (P09-E12 D5): what the predicate adjective is compared to —
// "the cat is bigger **than the dog**". It is a noun phrase of its own, like an owner, so it is one
// more hosted ring: painted by a noun-phrase builder editing `predicativeStandard` (whose head is its
// `subject`), placed, dragged and kept clear of the other rings by the period's canvas, and joined to
// the predicative by a line from the standard control on the predicative's dotted ring.

import { STANDARD_DEGREES } from "@signi/shared";
import { standardAddress, type NounAddress, type PhraseSelection } from "./interfaces.ts";
import { conjunctsOf } from "./phraseReducers.ts";
import { ownerLink, ownerPortKey, type OwnerSpot, type PossessionLink, type RingAt } from "./ownerChain.ts";
import { perimeterControlKey } from "./ringSpecs.ts";
import type { Pt } from "./ringLayout.ts";

/** The predicate adjective's standard: its ring's address, which is also its key on the canvas. */
export const STANDARD_ADDRESS: NounAddress = standardAddress("predicative");

/**
 * The standard's ring, in an owner's shape — the noun it hangs off, the period noun whose colour it
 * wears, where tidying packs it and whether it holds a word — plus whether it is dimmed.
 */
export type StandardSpot = OwnerSpot & {
  // The degree no longer takes a standard (positive, most, least): the translator drops it, so the
  // ring is drawn faded. The word is kept, and comes back into the sentence with the degree.
  dimmed: boolean;
};

/** Whether the predicate adjective's degree takes a standard — the gate on its control. */
export const takesStandard = (selection: PhraseSelection): boolean =>
  selection.predicative?.role === "adjective" &&
  STANDARD_DEGREES.has(selection.adjectiveDegrees?.predicative ?? "positive");

/**
 * The standard's ring on a canvas, or undefined when none is drawn: the predicative must be on the
 * canvas and hold an adjective, and the standard must be open — `open` is what the user last asked
 * its control for; unset, a named standard shows and an empty one doesn't. It packs straight after
 * the predicative's conjuncts ("bigger and older than the dog").
 */
export function standardSpotFor({
  selection,
  groups,
  open,
}: {
  selection: PhraseSelection;
  groups: readonly { mainKey: string }[];
  open: boolean | undefined;
}): StandardSpot | undefined {
  if (selection.predicative?.role !== "adjective") return undefined;
  if (!groups.some((g) => g.mainKey === "predicative")) return undefined;
  const named = Boolean(selection.predicativeStandard?.subject);
  if (!(open ?? named)) return undefined;
  return {
    address: STANDARD_ADDRESS,
    possessed: "predicative",
    possessedKey: "predicative",
    role: "predicative",
    order: conjunctsOf(selection, "predicative").length - 0.5,
    named,
    dimmed: !takesStandard(selection),
  };
}

/**
 * The line from the predicative to its standard's ring. It leaves from the standard control on the
 * predicative's dotted ring — from the ring's edge while the control is withdrawn (a dimmed
 * standard) — and lands on the port the standard's ring reported facing it.
 */
export function standardLink({
  spot,
  ringOf,
  controlOn,
  compact,
}: {
  spot: StandardSpot;
  ringOf: (key: string) => RingAt | undefined;
  controlOn: (key: string, control: string) => Pt | undefined;
  compact: boolean;
}): PossessionLink | null {
  return ownerLink({
    owned: ringOf(spot.possessedKey),
    owner: ringOf(spot.address),
    control: controlOn(spot.possessedKey, perimeterControlKey("standard", spot.possessedKey)),
    port: controlOn(spot.address, ownerPortKey(spot)),
    compact,
  });
}
