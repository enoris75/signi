import { SPECIAL_START, VOWEL_START } from './it.consts.js';

/**
 * Prenominal "bello", which inflects like the definite article according to the sound
 * of the word that follows it: bel/bello/bell'/bei/begli · bella/belle/bell'.
 */
export function belloForm(gender: string, plural: boolean, next: string): string {
  const vowel = VOWEL_START.test(next);
  const special = SPECIAL_START.test(next);
  if (gender === 'fem') {
    if (plural) return 'belle';
    return vowel ? "bell'" : 'bella';
  }
  if (plural) return (vowel || special) ? 'begli' : 'bei';
  if (vowel) return "bell'";
  return special ? 'bello' : 'bel';
}
