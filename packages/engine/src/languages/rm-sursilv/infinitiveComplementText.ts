import type { ResolvedPhrase } from '../../types.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { adBeforeVowel } from './adBeforeVowel.js';
import { predicateText } from './predicateText.js';

/**
 * An infinitive complement (see PhrasePlan.infinitiveComplement) as it follows the word governing it:
 * that word's link (`infinitive_link`, *a* or *da*), then the clause's bare infinitive — "chapabel
 * d'agir" is not written: "chapabel da agir", "cumenza a magliar", "vul magliar". *a* is *ad* before a
 * vowel ("gida ad ir"). The clause agrees with its controller (`controller`), as a participle
 * and an adjective do: "la gatta vul esser attenta", "el vul esser attents". A clause that governs one
 * in turn carries it along.
 *
 * The controller is never the clause's own negative subject (A171): the infinitive keeps its own
 * *buca* and takes none it lacks.
 */
export function infinitiveComplementText(clause: ResolvedPhrase, controller: Record<string, string>, link: string): string {
  if (!clause.verbPhrase) return '';
  const own = predicateText(controller, clause.verbPhrase, clause.directObject, clause.complements, undefined, false);
  const text = clause.infinitiveComplement
    ? `${own} ${infinitiveComplementText(clause.infinitiveComplement, controller, infinitiveLink(clause))}`
    : own;
  return [adBeforeVowel(link, text), text].filter(Boolean).join(' ');
}
