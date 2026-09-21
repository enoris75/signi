import type { ResolvedPhrase } from '../../types.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { elidesBefore } from './elidesBefore.js';
import { predicateText } from './predicateText.js';

/**
 * An infinitive complement (see PhrasePlan.infinitiveComplement) as it follows the word governing
 * it: that word's link, then the clause's bare infinitive — "capable d'agir", "obligé de manger la
 * nourriture", "désirer agir". "de" elides before a vowel sound as the article does; a negated clause
 * leads with "ne" and keeps it whole ("capable de ne pas agir"). The clause agrees with its
 * controller, the governing clause's subject (`controller`): "la chatte désire être prudente". A
 * clause that governs one in turn carries it along: "désirer être capable d'agir".
 *
 * The controller is never the clause's own negative subject: a `no` on it negates the governing
 * clause, not the infinitive, which is no self-negating "aucun" (A171): "aucun chat ne désire ne pas
 * manger", "aucun chat ne désire manger".
 */
export function infinitiveComplementText(clause: ResolvedPhrase, controller: Record<string, string>, link: string): string {
  if (!clause.verbPhrase) return '';
  const own = predicateText(controller, clause.verbPhrase, clause.directObject, clause.complements, undefined, undefined, false);
  const text = clause.infinitiveComplement
    ? `${own} ${infinitiveComplementText(clause.infinitiveComplement, controller, infinitiveLink(clause))}`
    : own;
  if (!link) return text;
  const lead = text.split(' ')[0] ?? '';
  return link === 'de' && elidesBefore(clause.verbPhrase.verb.forms, lead) ? `d'${text}` : `${link} ${text}`;
}
