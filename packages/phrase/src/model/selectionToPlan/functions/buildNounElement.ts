import type { CoordConjunction, NounElement, NounPhrase } from "@signi/shared";
import { CONJUNCTION_KEY, CONJUNCTS_KEY, conjunctAddress, type NounAddress, type NounKey, type PhraseSelection } from "../../interfaces.ts";
import { buildNounPhrase } from "./buildNounPhrase.ts";
import { field } from "./field.ts";

/**
 * Build the noun *element* filling a slot: the block's own noun phrase, plus any conjuncts
 * coordinated with it. Each conjunct is a nested selection whose head lives in its `subject`
 * slot, so it goes through `buildNounPhrase` exactly as a possessor does — which is what gives
 * a conjunct its own determiner, number/gender, adjectives, possessor and relative clause.
 *
 * A group needs at least two phrases, so a conjunct that has been added but is still empty
 * contributes nothing and the slot stays a plain noun phrase — the same rule the instrumental
 * link follows (a half-built period renders no complement rather than half of one).
 */
export function buildNounElement(
  sel: PhraseSelection,
  which: NounKey,
  root: PhraseSelection = sel,
  // Where the element sits in the period (see buildNounPhrase).
  address: NounAddress = which,
): NounElement | undefined {
  const head = buildNounPhrase(sel, which, root, address);
  if (!head) return undefined;
  const conjuncts = (field<PhraseSelection[]>(sel, CONJUNCTS_KEY(which)) ?? [])
    .map((c, i) => buildNounPhrase(c, "subject", root, conjunctAddress(address, i)))
    .filter((np): np is NounPhrase => Boolean(np));
  if (conjuncts.length === 0) return head;
  return {
    conjuncts: [head, ...conjuncts],
    conjunction: field<CoordConjunction>(sel, CONJUNCTION_KEY(which)) ?? "and",
    // "both … and" (P09-E46): the reducers hold the flag only on an "and" pair.
    ...(sel.correlatives?.[which] && { correlative: true as const }),
  };
}
