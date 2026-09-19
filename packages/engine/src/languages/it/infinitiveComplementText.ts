import type { ResolvedPhrase } from '../../types.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { predicateText } from './predicateText.js';

/**
 * An infinitive complement (see PhrasePlan.infinitiveComplement) as it follows the word governing
 * it: that word's link, then the clause's bare infinitive — "capace di agire", "obbligato ad agire",
 * "desiderare agire". The clause agrees with its controller, the governing clause's subject, in the
 * features the governing clause itself agrees in (`controller`): "la gatta desidera essere attenta".
 * A clause that governs one in turn carries it along: "desiderare essere capace di agire".
 */
export function infinitiveComplementText(clause: ResolvedPhrase, controller: Record<string, string>, link: string): string {
  if (!clause.verbPhrase) return '';
  const own = predicateText(controller, clause.verbPhrase, clause.directObject, clause.complements);
  const text = clause.infinitiveComplement
    ? `${own} ${infinitiveComplementText(clause.infinitiveComplement, controller, infinitiveLink(clause))}`
    : own;
  // "a" takes the euphonic d before another a: "obbligato ad agire", but "obbligato a essere".
  const word = link === 'a' && /^a/i.test(text) ? 'ad' : link;
  return [word, text].filter(Boolean).join(' ');
}
