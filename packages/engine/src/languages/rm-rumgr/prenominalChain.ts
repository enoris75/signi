import type { ConceptForms } from '../../types.js';
import { agreeAdj } from './agreeAdj.js';
import { rgDeg } from './rgDeg.js';

/**
 * The prenominal adjectives, each agreeing with the noun from its stored forms (RG has no prenominal
 * suppletion of the Italian *bel / buon* kind — "in bun chaun", "ina buna chasa").
 */
export function prenominalChain(pre: ConceptForms[], gender: string, plural: boolean): string[] {
  return pre.map((a) => rgDeg(a, agreeAdj(a.forms, gender, plural))).filter(Boolean);
}
