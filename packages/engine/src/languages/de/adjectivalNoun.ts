import { declineAdj } from './declineAdj.js';
import type { Case } from './de.types.js';

/**
 * An **adjectival noun** — a noun that declines like an adjective rather than like a noun: *der
 * Verwandte*, *ein Verwandter*, *einen Verwandten*, *meinem Verwandten*, bare plural *Verwandte*,
 * feminine *eine Verwandte* (P11 D8). Every German word for "relative" is one (*Verwandter*,
 * *Angehöriger*), and so is *Verlobter*; the same flag later serves *Bekannter*, *Erwachsener*,
 * *Angestellter* and *Deutscher*.
 *
 * The lexicon stores the bare stem as `base` (*Verwandt*) and marks it `adjectival: '1'`; the ending
 * is the one its determiner, case, gender and number select — the very table the phrase's own
 * adjectives decline by, so "meinem netten Verwandten" agrees all the way through. It therefore
 * replaces the noun rules a regular noun takes: no genitive -(e)s ("des Verwandten", not "*des
 * Verwandtes"), no weak -(e)n, no dative-plural -n ("mit den Verwandten").
 *
 * `word` is the head surface the compound builder has already assembled, so a compound declines on
 * its last element like any other. Any other noun is returned untouched.
 */
export function adjectivalNoun(
  word: string,
  forms: Record<string, string>,
  _case: Case,
  definiteness: string,
  plural: boolean,
): string {
  if (forms['adjectival'] !== '1' || !word) return word;
  return declineAdj(word, _case, forms['gender'] ?? 'neut', plural, definiteness);
}
