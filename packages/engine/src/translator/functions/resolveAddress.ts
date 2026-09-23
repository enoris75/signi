import type { NounElement } from '@signi/shared';
import { isNounGroup, nounConjuncts } from '@signi/shared';
import type { ResolvedPhrase } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { groupAgreement } from './groupAgreement.js';
import { resolveNounPhrase } from './resolveNounPhrase.js';

/**
 * The vocative (`PhrasePlan.address`, P11-E3) resolved for one language, as the verbless period each
 * engine already renders as a bare noun phrase — which is all a vocative is, set before its clause.
 *
 * It is **determiner-less** in every language (D2). Each conjunct resolves as the definite phrase
 * that a name is (so a kin term with `as_name` is one, "Mom and Dad", see `applyKinName`) and is then
 * marked bare, whatever the plan picked; a name is marked bare too, so a language that articles a
 * person's name as a subject leaves it off here ("Pedro, corra", not "o Pedro"). The head takes the
 * form address takes — the Japanese honorific of a kin term (D3, see `applyPossessorForm`).
 */
export function resolveAddress(address: NounElement, language: string, lookup: LexiconLookup): ResolvedPhrase {
  const conjuncts = nounConjuncts(address).map((np) => {
    const resolved = resolveNounPhrase({ ...np, definiteness: 'definite' }, language, lookup, true);
    const forms = resolved.head.forms;
    if (!forms['person']) {
      forms['definiteness'] = 'bare';
      if (forms['proper'] === '1') forms['takes_article'] = '0';
    }
    return resolved;
  });
  if (!isNounGroup(address) || conjuncts.length < 2) return { subject: { conjuncts, agreement: conjuncts[0].head.forms } };
  return {
    subject: {
      conjuncts,
      conjunction: address.conjunction,
      agreement: groupAgreement(conjuncts, address.conjunction, language),
      invertedAgreement: groupAgreement(conjuncts, address.conjunction, language, true),
    },
  };
}
