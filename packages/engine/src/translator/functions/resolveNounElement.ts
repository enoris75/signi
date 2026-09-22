import type { NounElement } from '@signi/shared';
import { isNounGroup, nounConjuncts } from '@signi/shared';
import type { ResolvedNounElement } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { groupAgreement } from './groupAgreement.js';
import { resolveNounPhrase } from './resolveNounPhrase.js';

/**
 * Resolve a noun slot: each conjunct as a full noun phrase, plus the agreement they resolve to
 * together — once for a verb after the group, once for a verb ahead of it, which an "or" group
 * agrees with through its first conjunct instead of its last (A210). A slot holding a single phrase
 * yields a one-conjunct element with that phrase's own head forms as its agreement — no
 * coordination, no behaviour change.
 *
 * The group's plural number is a fact about the *group*, not about its members, so it is not
 * pushed back down into the conjuncts: "Peter and the boys" keeps a singular Peter.
 */
export function resolveNounElement(el: NounElement, language: string, lookup: LexiconLookup): ResolvedNounElement {
  const conjuncts = nounConjuncts(el).map((np) => resolveNounPhrase(np, language, lookup));
  if (!isNounGroup(el) || conjuncts.length < 2) {
    return { conjuncts, agreement: conjuncts[0].head.forms };
  }
  return {
    conjuncts,
    conjunction: el.conjunction,
    agreement: groupAgreement(conjuncts, el.conjunction, language),
    invertedAgreement: groupAgreement(conjuncts, el.conjunction, language, /*verbFirst*/ true),
  };
}
