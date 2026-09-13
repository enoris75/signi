import { IRREGULAR_ADJ } from './pt.consts.js';
import { pluralize } from './pluralize.js';

/**
 * Inflect a Portuguese adjective (given as masculine singular) to agree with the head
 * noun's gender and number. "-o" adjectives take -a/-os/-as; adjectives ending in
 * -e or a consonant are gender-invariant and only pluralise.
 */
export function agreeAdj(base: string, gender: string, plural: boolean): string {
  if (!base) return '';
  const fem = gender === 'fem';
  const irr = IRREGULAR_ADJ[base];
  if (irr) return irr[(fem ? 1 : 0) + (plural ? 2 : 0)];
  const sg = base.endsWith('o') && fem ? `${base.slice(0, -1)}a` : base;
  return plural ? pluralize(sg) : sg;
}
