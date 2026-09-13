import { contractArt } from './contractArt.js';

/**
 * Spanish "a" (to) + definite article contractions:
 * a+el=al (only masculine singular contracts); bare "a" for an unarticled proper noun.
 */
export function datPrep(forms: Record<string, string>, plural = false): string {
  const art = contractArt(forms, plural);
  if (art === 'el') return 'al';
  return art ? `a ${art}` : 'a';
}
