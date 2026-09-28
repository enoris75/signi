import type { PronominalTable } from './pl.consts.js';
import type { Agr, Case } from './pl.types.js';

/**
 * One form of a pronominal paradigm (*ten, tamten, żaden, mój, …*) agreeing with its head: the
 * column by gender, or virile / non-virile in the plural, and the masculine animate accusative taken
 * from the genitive (*tego psa*, *mojego kota*), as an adjective's is.
 */
export function pronominalForm(table: PronominalTable, kase: Case, agr: Agr): string {
  const c = kase === 'voc' ? 'nom' : kase;
  const column = agr.plural ? (agr.virile ? 3 : 4) : agr.gender === 'fem' ? 1 : agr.gender === 'neut' ? 2 : 0;
  if (c === 'acc' && column === 0 && agr.animate) return table.gen[0];
  return table[c][column];
}
