import type { PronominalTable } from './lt.consts.js';
import type { Agr, Case } from './lt.types.js';

/**
 * One form of a pronominal paradigm (*šis, tas, joks, visi, keli, abu, du*) agreeing with its head:
 * the column by gender and number, a genderless head reading the masculine.
 */
export function pronominalForm(table: PronominalTable, kase: Case, agr: Agr): string {
  const c = kase === 'voc' ? 'nom' : kase;
  const column = (agr.plural ? 2 : 0) + (agr.gender === 'fem' ? 1 : 0);
  return table[c][column]!;
}
