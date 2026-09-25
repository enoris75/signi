import type { IndefiniteSpeller } from '../../translator/translator.types.js';
import { declineAdj } from './declineAdj.js';
import { deDegStem } from './deDegStem.js';

/**
 * German writes an adjective on an indefinite pronoun as a **neuter adjectival noun**, declined
 * strong in the pronoun's case and capitalised: *etwas Großes*, *nichts Neues*, *mit etwas Großem*
 * (P09-E36). Before it the pronoun stays undeclined, *jemand* and *niemand* too: *sieht jemand
 * Neues*, *mit niemand Neuem* (Duden, *jemand*: "jemand Fremdes, mit jemand Fremdem"), so the
 * citation form stands in every slot and only the adjective carries the case.
 *
 * OTHER (`after_pronoun`) is the one written lowercase, as standard orthography has it: *etwas
 * anderes*, *jemand anderes*, *nichts anderes*, *mit jemand anderem*.
 *
 * The slots map to cases as the pronoun's own forms do (see `tonicPronounDe`): `object` is the
 * accusative, `disjunctive` the dative, `base` the nominative.
 */
export const indefiniteModifierGsw: IndefiniteSpeller = (_surface, citation, adjective, key) => {
  const _case = key === 'disjunctive' ? 'dat' : key === 'object' ? 'acc' : 'nom';
  const other = adjective.forms['after_pronoun'];
  const stem = other ?? deDegStem(adjective, adjective.forms['base'] ?? '');
  const word = declineAdj(stem, _case, 'neut', false, 'bare');
  return `${citation} ${other ? word : word.charAt(0).toLocaleUpperCase('de') + word.slice(1)}`;
};
