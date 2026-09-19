import type { ResolvedPhrase } from '../../types.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { predicateText } from './predicateText.js';

/**
 * An infinitive complement (see PhrasePlan.infinitiveComplement) as it follows the word governing
 * it: that word's link, then the clause's bare infinitive — "capaz de actuar", "obligado a comer la
 * comida", "desear actuar". The clause agrees with its controller, the governing clause's subject
 * (`controller`): "la gata desea estar cansada". A clause that governs one in turn carries it along:
 * "desear ser capaz de actuar".
 */
export function infinitiveComplementText(clause: ResolvedPhrase, controller: Record<string, string>, link: string): string {
  if (!clause.verbPhrase) return '';
  const own = predicateText(controller, clause.verbPhrase, clause.directObject, clause.complements);
  const text = clause.infinitiveComplement
    ? `${own} ${infinitiveComplementText(clause.infinitiveComplement, controller, infinitiveLink(clause))}`
    : own;
  return [link, text].filter(Boolean).join(' ');
}
