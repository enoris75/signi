import { datPrep } from './datPrep.js';
import { prepDet } from './prepDet.js';

/** "a" + determiner: al only for the masc-sg definite; else plain "a" + the chosen determiner. */
export function aDet(forms: Record<string, string>, plural = false): string {
  if ((forms['definiteness'] ?? 'definite') === 'definite') return datPrep(forms, plural);
  return prepDet('a', forms, plural);
}
