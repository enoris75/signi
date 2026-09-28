import type { PronominalPossessor } from '../../types.js';
import { possessiveTable } from './possessiveTable.js';
import { pronominalForm } from './pronominalForm.js';
import type { Agr, Case } from './pl.types.js';

/**
 * The possessive pronoun for a possessor's features, agreeing with the possessed head (P05 §2.1):
 * *mój, twój, nasz, wasz* decline; the 3rd person's *jego, jej, ich* do not. `reflexive` is the
 * possessor that is the clause's own subject, which Polish says with ***swój*** whatever its person
 * (P05 §0.5, see `isReflexivePossessor`).
 */
export function possessivePl(possessor: PronominalPossessor, kase: Case, agr: Agr, reflexive = false): string {
  const plural = possessor.number === 'plural';
  if (reflexive) return pronominalForm(possessiveTable('swój'), kase, agr);
  if (possessor.person === '1') return pronominalForm(possessiveTable(plural ? 'nasz' : 'mój'), kase, agr);
  if (possessor.person === '2') return pronominalForm(possessiveTable(plural ? 'wasz' : 'twój'), kase, agr);
  return plural ? 'ich' : possessor.gender === 'fem' ? 'jej' : 'jego';
}
