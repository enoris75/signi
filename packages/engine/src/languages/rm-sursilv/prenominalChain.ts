import type { ConceptForms } from '../../types.js';
import { agreeAdj } from './agreeAdj.js';
import { sursilvDeg } from './sursilvDeg.js';

/**
 * The prenominal adjectives, each agreeing with the noun from its stored forms (no prenominal
 * suppletion of the Italian *bel / buon* kind — "in bun tgaun", "ina buna casa").
 */
export function prenominalChain(pre: ConceptForms[], gender: string, plural: boolean): string[] {
  return pre.map((a) => sursilvDeg(a, agreeAdj(a.forms, gender, plural))).filter(Boolean);
}
