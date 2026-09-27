import type { ConceptForms } from '../../types.js';
import { agreeAdj } from './agreeAdj.js';
import { vlDeg } from './vlDeg.js';

/**
 * The prenominal adjectives, each agreeing with the noun from its stored forms (Vallader has no
 * prenominal suppletion of the Italian *bel / buon* kind — "ün bun chan", "üna buna chasa").
 */
export function prenominalChain(pre: ConceptForms[], gender: string, plural: boolean): string[] {
  return pre.map((a) => vlDeg(a, agreeAdj(a.forms, gender, plural))).filter(Boolean);
}
