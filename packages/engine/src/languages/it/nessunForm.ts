import { SPECIAL_START, VOWEL_START } from './it.consts.js';

/**
 * "nessun" (no), inflected like the indefinite article: masc "nessun" / "nessuno"
 * (s-impura, z) · fem "nessuna" / "nessun'" before a vowel. Singular, but for a plurale tantum,
 * which has no singular to take it: "nessune notizie" (P09-E41's NEWS).
 */
export function nessunForm(gender: string, lead: string, plural = false): string {
  if (plural) return gender === 'fem' ? 'nessune' : 'nessuni';
  if (gender === 'fem') return VOWEL_START.test(lead) ? "nessun'" : 'nessuna';
  return SPECIAL_START.test(lead) ? 'nessuno' : 'nessun';
}
