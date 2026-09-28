import type { BoundPossessor, PronominalPossessor } from '../../types.js';

/**
 * Whether a pronominal possessor is the subject of its own clause, which Lithuanian says with *savo*
 * (P18 §0.4): *katė valgo **savo** maistą*, where *jo maistą* is someone else's.
 *
 * No plan flag is needed (P05 §0.5 had proposed `subjectAntecedent`): the plan already links a possessor to
 * its clause's subject (`CoreferentPossessor`, P11-E2), and the translator binds it, marked
 * `coreferent: 'subject'` (`BoundPossessor`) — that is the 3rd person's case. A 1st or 2nd person
 * possessor needs no link: it is the subject's whenever the subject is the same person and number
 * (*valgau **savo** maistą*, "I eat my food"), the norm, *mano* being marked (P18 §0.4). `subject` is the
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
