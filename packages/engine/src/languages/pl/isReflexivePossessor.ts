import type { BoundPossessor, PronominalPossessor } from '../../types.js';

/**
 * Whether a pronominal possessor is the subject of its own clause, which Polish says with *swój*
 * (P05 §0.5): *kot je **swoje** jedzenie*, where *jego jedzenie* is someone else's.
 *
 * No plan flag is needed (P05 §0.5 proposed `subjectAntecedent`): the plan already links a possessor to
 * its clause's subject (`CoreferentPossessor`, P11-E2), and the translator binds it, marked
 * `coreferent: 'subject'` (`BoundPossessor`) — that is the 3rd person's case. A 1st or 2nd person
 * possessor needs no link: it is the subject's whenever the subject is the same person and number
 * (*jem **swoje** jedzenie*, "I eat my food") (verify: *moje* is also heard there). `subject` is the
 * clause's subject agreement, absent in the subject itself and outside a clause.
 */
export function isReflexivePossessor(
  possessor: PronominalPossessor | BoundPossessor,
  subject: Record<string, string> | undefined,
): boolean {
  if (!subject) return false;
  if ('coreferent' in possessor && possessor.coreferent === 'subject') return true;
  if (possessor.person === '3') return false;
  return subject['person'] === possessor.person && (subject['number'] ?? 'singular') === possessor.number;
}
