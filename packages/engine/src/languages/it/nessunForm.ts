import { SPECIAL_START, VOWEL_START } from './it.consts.js';

/**
 * "nessun" (no), inflected like the indefinite article: masc "nessun" / "nessuno"
 * (s-impura, z) · fem "nessuna" / "nessun'" before a vowel. Always singular.
 */
export function nessunForm(gender: string, lead: string): string {
  if (gender === 'fem') return VOWEL_START.test(lead) ? "nessun'" : 'nessuna';
  return SPECIAL_START.test(lead) ? 'nessuno' : 'nessun';
}
