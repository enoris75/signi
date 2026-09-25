// A noun's examples on a canvas (P09-E48): the members of the set it names — "animals **such as the
// cat**", "the animals, **including the cat**,". A noun phrase of its own, like an owner or a standard,
// so it is one more hosted ring: painted by a noun-phrase builder editing `${noun}Examples` (whose head
// is its `subject`), placed, dragged and kept clear of the other rings by the period's canvas, and
// joined to its noun by a line from the examples control on that noun's dotted ring. The line carries
// a chip naming the relation, which a click flips. Each period noun has at most one.

import type { Concept } from "@signi/shared";
import { examplesAddress, EXAMPLES_KEY, type NounAddress, type NounKey, type PhraseSelection } from "./interfaces.ts";
import { conjunctsOf } from "./phraseReducers.ts";
import { NOUN_KEYS } from "./slots.ts";
import { ownerLink, ownerPortKey, type OwnerSpot, type PossessionLink, type RingAt } from "./ownerChain.ts";
import { perimeterControlKey } from "./ringSpecs.ts";
import type { Pt } from "./ringLayout.ts";

/** An examples ring, in an owner's shape, plus the relation its chip names. */
export type ExamplesSpot = OwnerSpot & {
  relation: "example" | "inclusion";
};

/** Whether a noun takes examples — the gate on its control: a noun head names a set (D2). */
export const takesExamples = (selection: PhraseSelection, which: NounKey): boolean =>
  (selection[which] as Concept | undefined)?.role === "noun";

/** The relation a noun's examples stand in: *including*, or — unset — *such as*. */
export const exampleRelationOf = (selection: PhraseSelection, which: NounKey): "example" | "inclusion" =>
  selection.exampleRelations?.[which] ?? "example";

/**
 * The examples rings on a canvas, one per period noun that draws one: the noun must be on the canvas
 * with a noun head, and its examples must be open — `open` is what the user last asked its control
 * for, by address; unset, named examples show and empty ones don't. Each packs after its noun's
 * conjuncts, past its standard.
 */
export function examplesSpotsFor({
  selection,
  groups,
  open,
}: {
  selection: PhraseSelection;
  groups: readonly { mainKey: string }[];
  open: Readonly<Record<NounAddress, boolean>>;
}): ExamplesSpot[] {
  return NOUN_KEYS.flatMap((which) => {
    if (!takesExamples(selection, which)) return [];
    if (!groups.some((g) => g.mainKey === which)) return [];
    const address = examplesAddress(which);
    const named = Boolean((selection[EXAMPLES_KEY(which)] as PhraseSelection | undefined)?.subject);
    if (!(open[address] ?? named)) return [];
    return [{
      address,
      possessed: which,
      possessedKey: which,
      role: which,
      order: conjunctsOf(selection, which).length - 0.25,
      named,
      relation: exampleRelationOf(selection, which),
    }];
  });
}

/**
 * The line from a noun to its examples' ring: from the examples control on the noun's dotted ring to
 * the port the examples ring reported facing it.
 */
export function examplesLink({
  spot,
  ringOf,
  controlOn,
  compact,
}: {
  spot: ExamplesSpot;
  ringOf: (key: string) => RingAt | undefined;
  controlOn: (key: string, control: string) => Pt | undefined;
  compact: boolean;
}): PossessionLink | null {
  return ownerLink({
    owned: ringOf(spot.possessedKey),
    owner: ringOf(spot.address),
    control: controlOn(spot.possessedKey, perimeterControlKey("examples", spot.possessedKey)),
    port: controlOn(spot.address, ownerPortKey(spot)),
    compact,
  });
}
