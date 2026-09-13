import { SPECIAL_START, VOWEL_START } from './it.consts.js';

/**
 * Prenominal "buono", which apocopates in the masculine singular ("il buon cane",
 * "il buon amico") except before s-impura/z ("il buono studente"); fem "buon'" elides
 * before a vowel ("la buon'amica").
 */
export function buonoForm(gender: string, plural: boolean, next: string): string {
  const vowel = VOWEL_START.test(next);
  const special = SPECIAL_START.test(next);
  if (gender === 'fem') {
    if (plural) return 'buone';
    return vowel ? "buon'" : 'buona';
  }
  if (plural) return 'buoni';
  return special ? 'buono' : 'buon';
}
