import { INVARIABLE_ADJ } from './es.consts.js';
import { pluralize } from './pluralize.js';

/**
 * Inflect a Spanish adjective (given as masculine singular) to agree with the head
 * noun's gender and number. "-o" adjectives take -a/-os/-as; adjectives ending in
 * -e or a consonant are gender-invariant and only pluralise.
 */
export function agreeAdj(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  if (INVARIABLE_ADJ.has(base)) return base; // cero
  const sg = base.endsWith('o') && gender === 'fem' ? `${base.slice(0, -1)}a` : base;
  return plural ? pluralize(sg) : sg;
}
