import type { ResolvedNounPhrase } from '../../types.js';
import type { Case } from './de.types.js';
import { deStandard } from './deStandard.js';

/**
 * The standard of comparison of a noun phrase's one attributive adjective (P09-E18), with a leading
 * space, or ''. The adjective stays before the noun, declined as ever, and the standard follows the
 * noun in `_case`, the phrase's own: "sieht einen größeren Kater **als den Hund**", "ist ein größeres
 * Tier **als der Hund**", "gibt einem größeren Kater **als dem Hund** das Buch" — "als" and "wie" are
 * conjunctions, and the standard is parallel to the phrase it compares with.
 *
 * It stands after the noun's genitives, its possessor included, and before a relative clause: "einen
 * größeren Kater der Frau als den Hund", since "*als den Hund der Frau" would give the woman's dog.
 */
export function nounStandard(np: ResolvedNounPhrase, _case: Case): string {
  const own = np.adjectiveStandard;
  const a = own ? np.adjectives[own.index] : undefined;
  if (!own || !a) return '';
  const text = deStandard(a, own.standard, _case);
  return text ? ` ${text}` : '';
}
