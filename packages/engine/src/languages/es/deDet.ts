import { dePrep } from './dePrep.js';
import { prepDet } from './prepDet.js';

/** "de" + determiner: del only for the masc-sg definite; else plain "de" + the chosen determiner. */
export function deDet(forms: Record<string, string>, plural = false): string {
  if ((forms['definiteness'] ?? 'definite') === 'definite') return dePrep(forms, plural);
  return prepDet('de', forms, plural);
}
