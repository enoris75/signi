import type { ResolvedPhrase } from '../../types.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { predicateText } from './predicateText.js';

/**
 * An infinitive complement (see PhrasePlan.infinitiveComplement) as it follows the word governing
 * it: that word's link, then the clause's bare infinitive — "capaz de agir", "obrigado a comer a
 * comida", "desejar agir". The clause agrees with its controller, the governing clause's subject
 * (`controller`): "a gata deseja estar cansada". A clause that governs one in turn carries it along:
 * "desejar ser capaz de agir".
 */
export function infinitiveComplementText(clause: ResolvedPhrase, controller: Record<string, string>, link: string): string {
  if (!clause.verbPhrase) return '';
  const own = predicateText(controller, clause.verbPhrase, clause.directObject, clause.complements);
  const text = clause.infinitiveComplement
    ? `${own} ${infinitiveComplementText(clause.infinitiveComplement, controller, infinitiveLink(clause))}`
    : own;
  return [link, text].filter(Boolean).join(' ');
}
