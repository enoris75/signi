import type { ResolvedNounPhrase } from '../../types.js';
import { IT_DI_BEFORE_PRONOUN } from './it.consts.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { type ItPreposition, prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * One conjunct of the object of a verb that takes it with a preposition (A139): the preposition fused
 * with the definite article, as a complement's is ("clicca sul pulsante", "sulla casa", "su un
 * pulsante"). A pronoun is no clitic there: it takes its tonic form, through "di" after "su"
 * ("clicca su di me", "su di lui").
 */
export function prepObjectText(np: ResolvedNounPhrase, prep: string): string {
  const f = np.head.forms;
  if (f['person']) return [prep, IT_DI_BEFORE_PRONOUN.has(prep) ? 'di' : '', f['disjunctive'] ?? f['base'] ?? ''].filter(Boolean).join(' ');
  // The lexeme names one of the prepositions `prepDet` knows.
  return renderNP(np, (plural, lead) => prepDet(prep as ItPreposition, itPossessedHeadForms(np), plural, lead));
}
