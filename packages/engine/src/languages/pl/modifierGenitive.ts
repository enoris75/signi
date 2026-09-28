import type { ResolvedNounModifier } from '../../types.js';
import { adjForm } from './adjForm.js';
import { nounAgr } from './nounAgr.js';
import { nounForm } from './nounForm.js';

/**
 * An attributive noun (a noun modifier, P05 §2.1): the genitive after its head, with its own
 * adjectives agreeing with it (*twórca fraz semantycznych*) — for every relation the plan names, the
 * Polish genitive standing where English writes a compound (verify: a relational adjective, *łódź
 * żaglowa*, is often the better word, and the lexicon has none).
 */
export function modifierGenitive(m: ResolvedNounModifier): string {
  const f = m.concept.forms;
  const agr = nounAgr(f);
  const adjectives = m.adjectives.map((a) => ({ text: adjForm(a, 'gen', agr), post: a.forms['position'] === 'post' }));
  return [
    ...adjectives.filter((a) => !a.post).map((a) => a.text),
    nounForm(f, 'gen', agr.plural),
    ...adjectives.filter((a) => a.post).map((a) => a.text),
  ].join(' ');
}
