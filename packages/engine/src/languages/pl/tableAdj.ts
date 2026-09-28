import type { Agr, Case } from './pl.types.js';

/**
 * An adjective that stores its whole table (style-pl.md: *ten sam*, and the invariable phrases *w
 * porządku*, *bez tytułu*): the nominatives under `base, fem, neut, virile, nonvirile`, the oblique
 * cases under `gen … loc` (masculine) and the same behind `fem_`, `neut_`, `virile_`, `nonvirile_`,
 * and the masculine animate accusative under `acc_animate`. A missing cell falls back on the column's
 * nominative.
 */
export function tableAdj(forms: Record<string, string>, kase: Case, agr: Agr): string {
  const column = agr.plural ? (agr.virile ? 'virile' : 'nonvirile') : agr.gender === 'masc' ? '' : agr.gender;
  const nominative = (column === '' ? forms['base'] : forms[column]) ?? forms['base'] ?? '';
  if (kase === 'nom' || kase === 'voc') return nominative;
  if (kase === 'acc' && !agr.plural && agr.gender === 'masc' && agr.animate && forms['acc_animate']) return forms['acc_animate'];
  return forms[column === '' ? kase : `${column}_${kase}`] ?? nominative;
}

/** Whether an adjective stores its table rather than declining by rule. */
export function isTableAdj(forms: Record<string, string>): boolean {
  return forms['acc_animate'] !== undefined || forms['invariable'] === '1';
}
