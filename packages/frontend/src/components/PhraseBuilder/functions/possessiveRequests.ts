import type { Concept, PronominalPossessor } from "@signi/shared";
import type { PossessiveRequest } from "../../../i18n/usePossessivePhrase.ts";
import type { CorefPick } from "../CorefPickContext.tsx";
import { POSSESSOR_KEY, POSSESSOR_REF_KEY, type NounAddress, type NounKey, type PhraseSelection } from "../interfaces.ts";
import type { OwnerSpot, PointerSpot } from "../ownerChain.ts";
import type { LinkClause } from "./subjectLink.ts";
import { NOUN_KEYS } from "../slots.ts";
import { isPersonalPronoun, pronounFeatures } from "@signi/phrase/model/selectionToPlan/functions/pronounFeatures.ts";

/**
 * Every possessed noun phrase this canvas needs rendered — one per noun whose possessor points at
 * another noun, and one per noun whose named owner is a pronoun ("my mother", P11-E9 D7; see
 * `usePossessivePhrases`). Two sources, because the two surfaces that show the phrase see different
 * things: the chips on the lines come from the canvas's `pointers` and `owners`, which a *hosted*
 * ring's builder leaves to its parent, while the possessor control's own tooltip is drawn by
 * whichever builder owns the noun and so walks the local selection. The pairs are deduplicated
 * downstream, so a noun reached both ways is rendered once.
 */
export function possessiveRequests(
  selection: PhraseSelection,
  pointers: readonly PointerSpot[],
  coref: Pick<CorefPick, "resolve" | "linkOf">,
  owners: readonly OwnerSpot[] = [],
  // A local noun's address in the period (see builderNounAddress): where a pointer stands decides
  // whether it is the link to the subject (P11-E7).
  addressOf: (which: NounKey) => NounAddress = (which) => which,
): PossessiveRequest[] {
  const out: PossessiveRequest[] = [];
  const push = (concept: string | undefined, features: PronominalPossessor | undefined, clause?: LinkClause) => {
    if (concept && features) out.push({ concept, features, ...(clause && { clause }) });
  };
  // A pointer renders as the copy it is, or — the link to its clause's subject — in that clause.
  const add = (concept: string | undefined, possessed: NounAddress, antecedent: NounAddress | undefined) => {
    if (antecedent) push(concept, coref.resolve(antecedent)?.features, coref.linkOf(possessed, antecedent));
  };
  for (const spot of pointers) add(spot.possessedConcept, spot.possessed, spot.antecedent);
  for (const spot of owners) push(spot.possessedConcept, spot.pronoun);
  for (const which of NOUN_KEYS) {
    const concept = (selection[which] as Concept | undefined)?.id;
    add(concept, addressOf(which), selection[POSSESSOR_REF_KEY(which)] as NounAddress | undefined);
    push(concept, namedPronounOwner(selection, which));
  }
  return out;
}

/** The possessive a noun's named owner spells, when that owner is one of the three persons (P11-E9). */
export function namedPronounOwner(selection: PhraseSelection, which: NounKey): PronominalPossessor | undefined {
  if (selection[POSSESSOR_REF_KEY(which)]) return undefined;
  const owner = selection[POSSESSOR_KEY(which)] as PhraseSelection | undefined;
  const head = owner?.subject;
  return owner && head && isPersonalPronoun(head) ? pronounFeatures(owner, "subject", head) : undefined;
}
