import type { ConceptForms } from '../../types.js';
import { defArticle } from './defArticle.js';

/**
 * A predicate ordinal ("ist der Erste") — A225. An ordinal has no undeclined predicative form the
 * way "müde" has ("*ist erste"): German says the rank with the definite article and the nominalised
 * ordinal, which takes the gender and number of what it is said of and a capital, weak after the
 * article — "der Kater ist der Erste", "die Katze ist die Erste", "die Kater sind die Ersten".
 *
 * `agreement` is what the predicate is said of: the clause's subject, a causative's causee, a
 * relative's head. The article-less "wurde Erster" (placed first in a race) is German too; the
 * definite reading is the one that holds without a race.
 */
export function dePredOrdinal(a: ConceptForms, agreement: Record<string, string>): string {
  const base = a.forms['base'] ?? '';
  if (!base) return '';
  const plural = (agreement['number'] ?? agreement['count']) === 'plural';
  const noun = `${base.charAt(0).toUpperCase()}${base.slice(1)}${plural ? 'n' : ''}`;
  return `${defArticle(agreement, 'nom', plural)} ${noun}`;
}
