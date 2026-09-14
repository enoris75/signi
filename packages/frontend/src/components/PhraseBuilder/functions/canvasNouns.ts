import type { NounKey, PhraseSelection } from "../interfaces.ts";
import { openConjunctsFor } from "../conjunctChain.ts";
import { conjunctsOf } from "../phraseReducers.ts";
import type { Satellite } from "../satellites/index.ts";

/**
 * The coordinated nouns whose ring is on a canvas, each with its number of conjuncts: each draws its
 * conjuncts' rings after its own.
 */
export function canvasChains(
  selection: PhraseSelection,
  groups: readonly { mainKey: string }[],
): { which: NounKey; count: number }[] {
  return openConjunctsFor(selection)
    .filter((which) => groups.some((g) => g.mainKey === which))
    .map((which) => ({ which, count: conjunctsOf(selection, which).length }));
}

/** The nouns on a canvas that may take an owner: those whose possessor control is offered. */
export function ownableNouns(
  groups: readonly { mainKey: string }[],
  satellites: readonly Pick<Satellite, "key" | "available">[],
): NounKey[] {
  return groups
    .map((g) => g.mainKey as NounKey)
    .filter((k) => satellites.some((sat) => sat.key === `${k}Possessor` && sat.available));
}
