import type { ConceptForms } from '../../types.js';
import type { Case } from './de.types.js';
import { declineAdj } from './declineAdj.js';
import { defArticle } from './defArticle.js';

/**
 * A predicate ordinal ("ist der Erste") — A225. An ordinal has no undeclined predicative form the
 * way "müde" has ("*ist erste"): German says the rank with the definite article and the nominalised
 * ordinal, which takes the gender and number of what it is said of and a capital, weak after the
 * article — "der Kater ist der Erste", "die Katze ist die Erste", "die Kater sind die Ersten".
 *
 * `agreement` is what the predicate is said of: the clause's subject, a causative's causee, a
 * relative's head — or, for an essive object predicate, the direct object (A231). `_case` is that
 * one's case, which "als" shares with it: the nominative of a subject predicate, the accusative of
 * an object one, where a masculine takes the weak -n too ("sieht den Hund als den Ersten"). The
 * article-less "wurde Erster" (placed first in a race) is German too; the definite reading is the
 * one that holds without a race.
 */
export function dePredOrdinal(a: ConceptForms, agreement: Record<string, string>, _case: Case = 'nom'): string {
  const base = a.forms['base'] ?? '';
  if (!base) return '';
  const plural = (agreement['number'] ?? agreement['count']) === 'plural';
  const word = declineAdj(base, _case, agreement['gender'] ?? 'neut', plural, 'definite');
  return `${defArticle(agreement, _case, plural)} ${word.charAt(0).toUpperCase()}${word.slice(1)}`;
}
