import type { Agr, Case } from './lt.types.js';

/**
 * An adjective that stores its whole table (the column's *tas pats*, the participles *suaugęs,
 * pavargęs, ateinantis*, *dešinys*; style-lt.md, the pronoun scheme): the nominatives under `base`,
 * `fem`, `plural`, `plural_fem`, `neuter`, the oblique cases under `gen … loc` (masculine singular) and
 * the same behind `fem_`, `plural_`, `plural_fem_`. An invariable one (*gerai*, *be pavadinimo*) is its
 * `base` everywhere. A missing cell falls back on the column's nominative, then on `base`.
 */
export function tableAdj(forms: Record<string, string>, kase: Case, agr: Agr): string {
  const base = forms['base'] ?? '';
  if (forms['invariable'] === '1') return base;
  const c = kase === 'voc' ? 'nom' : kase;
  const column = agr.plural ? (agr.gender === 'fem' ? 'plural_fem' : 'plural') : agr.gender === 'fem' ? 'fem' : '';
  if (c === 'nom') {
    if (agr.gender === 'neut' && !agr.plural) return forms['neuter'] ?? base;
    return (column === '' ? base : forms[column]) ?? base;
  }
  const nominative = (column === '' ? base : forms[column]) ?? base;
  return forms[column === '' ? c : `${column}_${c}`] ?? nominative;
}

/** Whether an adjective stores its table (or is invariable) rather than declining by rule. */
export function isTableAdj(forms: Record<string, string>): boolean {
  return forms['invariable'] === '1' || forms['gen'] !== undefined || forms['fem_gen'] !== undefined;
}
