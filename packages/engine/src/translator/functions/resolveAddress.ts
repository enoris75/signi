import type { NounElement } from '@signi/shared';
import { isNounGroup, nounConjuncts } from '@signi/shared';
import type { ResolvedPhrase } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { groupAgreement } from './groupAgreement.js';
import { resolveNounPhrase } from './resolveNounPhrase.js';

/**
 * The languages whose subject pronoun is a clitic, leaning on a verb, so that a pronoun standing on
 * its own in address takes its tonic (disjunctive) form: French *Toi, cours !*, never *Tu, cours*
 * (A335). The others call the hearer with the nominative (it *Tu*, es *Tú*, de *Du*, pt *Você*); the
 * German `disjunctive` is the dative (*dir*), which would be wrong here.
 */
const TONIC_ADDRESS = new Set(['fr']);

/**
 * The vocative (`PhrasePlan.address`, P11-E3) resolved for one language, as the verbless period each
 * engine already renders as a bare noun phrase — which is all a vocative is, set before its clause.
 *
 * It is **determiner-less** in every language (D2). Each conjunct resolves as the definite phrase
 * that a name is (so a kin term with `as_name` is one, "Mom and Dad", see `applyKinName`) and is then
 * marked bare, whatever the plan picked; a name is marked bare too, so a language that articles a
 * person's name as a subject leaves it off here ("Pedro, corra", not "o Pedro"), and so is a possessed
 * head, which the `vocative` form keeps off the article its possessive rides on elsewhere ("Mio amico,
 * corri", "Meu pai, corra"; A336). The head takes the
 * form address takes — the Japanese honorific of a kin term (D3, see `applyPossessorForm`), and the
 * French tonic pronoun (A335, see `TONIC_ADDRESS`).
 */
export function resolveAddress(address: NounElement, language: string, lookup: LexiconLookup): ResolvedPhrase {
  const conjuncts = nounConjuncts(address).map((np) => {
    const resolved = resolveNounPhrase({ ...np, definiteness: 'definite' }, language, lookup, true);
    const forms = resolved.head.forms;
    if (!forms['person']) {
      forms['definiteness'] = 'bare';
      // A possessed head's builders put the article back beside a possessive (it "il mio amico", pt
      // "o meu amigo"); `vocative` tells them this one has none (A336).
      forms['vocative'] = '1';
      if (forms['proper'] === '1') forms['takes_article'] = '0';
    } else if (forms['person'] !== '2' && forms['indefinite'] !== '1') {
      // The one a vocative calls is the hearer, so a personal pronoun there is the 2nd person; "I,
      // the cat runs" or "He, run" is no address. Refused by name, a group with such a conjunct whole
      // (A338). An indefinite pronoun calls whoever hears it ("Someone, run!"), and is not refused.
      throw new Error(`an address calls the hearer: plan.address cannot be a ${forms['person'] === '1' ? '1st' : '3rd'}-person pronoun (A338)`);
    } else if (TONIC_ADDRESS.has(language) && forms['disjunctive']) {
      forms['base'] = forms['disjunctive'];
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
