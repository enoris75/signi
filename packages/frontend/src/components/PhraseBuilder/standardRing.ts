// The standard of comparison on a canvas (P09-E12 D5): what a compared adjective is measured against —
// "the cat is bigger **than the dog**", and, off a noun's attributive adjective, "sees a bigger cat
// **than the dog**" (P09-E50). It is a noun phrase of its own, like an owner, so it is one more hosted
// ring: painted by a noun-phrase builder editing `${noun}Standard` (whose head is its `subject`),
// placed, dragged and kept clear of the other rings by the period's canvas, and joined to its noun by
// a line from the standard control on that noun's dotted ring. Each period noun has at most one.

import type { Concept } from "@signi/shared";
import { comparedAdjectiveIndex, readsAsSet, takesStandardOrSet } from "@signi/phrase/model/functions/comparison.ts";
import { standardAddress, STANDARD_KEY, type NounAddress, type NounKey, type PhraseSelection } from "./interfaces.ts";
import { conjunctsOf } from "./phraseReducers.ts";
import { NOUN_KEYS } from "./slots.ts";
import { ownerLink, ownerPortKey, type OwnerSpot, type PossessionLink, type RingAt } from "./ownerChain.ts";
import { perimeterControlKey } from "./ringSpecs.ts";
import type { Pt } from "./ringLayout.ts";

/**
 * A standard's ring, in an owner's shape — the noun it hangs off, the period noun whose colour it
 * wears, where tidying packs it and whether it holds a word — plus whether it is dimmed.
 */
export type StandardSpot = OwnerSpot & {
  // No degree takes it (the positive, or a noun with no compared adjective): the plan leaves it out,
  // so the ring is drawn faded. The word is kept, and comes back into the sentence with the degree.
  dimmed: boolean;
  // The degree is a superlative, so the standard reads as the set it picks from ("the biggest **of
  // the dogs**", P09-E51): the ring is titled the comparison set, not the standard of comparison.
  set: boolean;
};

const headOf = (selection: PhraseSelection, which: NounKey) => selection[which] as Concept | undefined;

/** Whether a noun's head can carry a standard at all: a noun, or the predicate adjective. */
const holdsStandard = (selection: PhraseSelection, which: NounKey): boolean => {
  const role = headOf(selection, which)?.role;
  return role === "noun" || (which === "predicative" && role === "adjective");
};

/**
 * Whether a noun's standard is live — the gate on its control. The predicate adjective's takes one on
 * every degree but the positive: a rival on the comparatives and the equative, a set on the
 * superlatives (P09-E51 D1). A noun's takes one while an adjective of its compares (P09-E50 D3).
 */
export function takesStandard(selection: PhraseSelection, which: NounKey = "predicative"): boolean {
  const role = headOf(selection, which)?.role;
  if (role === "adjective") return which === "predicative" && takesStandardOrSet(selection.adjectiveDegrees?.[which]);
  return role === "noun" && comparedAdjectiveIndex(selection, which) !== undefined;
}

/** Whether a predicate adjective's standard reads as a superlative's set (P09-E51 D2). */
export const standardIsSet = (selection: PhraseSelection, which: NounKey = "predicative"): boolean =>
  which === "predicative" && headOf(selection, which)?.role === "adjective" && readsAsSet(selection.adjectiveDegrees?.[which]);

/**
 * The standards' rings on a canvas, one per period noun that draws one: the noun must be on the canvas
 * with a noun head (or the predicate adjective), and its standard must be open — `open` is what the
 * user last asked its control for, by address; unset, a named standard shows and an empty one
 * doesn't. Each packs straight after its noun's conjuncts ("bigger and older than the dog").
 */
export function standardSpotsFor({
  selection,
  groups,
  open,
}: {
  selection: PhraseSelection;
  groups: readonly { mainKey: string }[];
  open: Readonly<Record<NounAddress, boolean>>;
}): StandardSpot[] {
  return NOUN_KEYS.flatMap((which) => {
    if (!holdsStandard(selection, which)) return [];
    if (!groups.some((g) => g.mainKey === which)) return [];
    const address = standardAddress(which);
    const named = Boolean((selection[STANDARD_KEY(which)] as PhraseSelection | undefined)?.subject);
    if (!(open[address] ?? named)) return [];
    return [{
      address,
      possessed: which,
      possessedKey: which,
      role: which,
      order: conjunctsOf(selection, which).length - 0.5,
      named,
      dimmed: !takesStandard(selection, which),
      set: standardIsSet(selection, which),
    }];
  });
}

/**
 * The line from a noun to its standard's ring. It leaves from the standard control on the noun's
 * dotted ring — from the ring's edge while the control is withdrawn (a dimmed standard) — and lands
 * on the port the standard's ring reported facing it.
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
