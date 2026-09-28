import type { ResolvedNounModifier } from '../../types.js';
import { adjForm } from './adjForm.js';
import { nounAgr } from './nounAgr.js';
import { nounForm } from './nounForm.js';

/**
 * An attributive noun (a noun modifier, P18 §2.1): the genitive **before** its head, with its own
 * adjectives agreeing with it (*semantinių frazių kūrėjas*) — for every relation the plan names, the
 * Lithuanian genitive standing where English writes a compound (verify: a relational adjective,
 * *medinis namas*, is often the better word, and the lexicon has none).
 */
export function modifierGenitive(m: ResolvedNounModifier): string {
  const f = m.concept.forms;
  const agr = nounAgr(f);
  return [...m.adjectives.map((a) => adjForm(a, 'gen', agr)), nounForm(f, 'gen', agr.plural)].join(' ');
}
