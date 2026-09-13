import { VOWEL_START } from './fr.consts.js';
import { artFor } from './artFor.js';
import { dePrep } from './dePrep.js';
import { elidesBefore } from './elidesBefore.js';

/**
 * "de" + determiner. Only the definite fuses (du/des/de la/de l'). Otherwise French drops the
 * indefinite/partitive article after "de" (de+des → "de maisons", de+du/de la → "d'eau") and
 * elides before a vowel; a surviving quantifier or "un/une" is kept ("de quelques maisons",
 * "d'une maison").
 */
export function deDet(forms: Record<string, string>, plural: boolean, lead: string): string {
  const def = forms['definiteness'] ?? 'definite';
  if (def === 'definite') return dePrep(forms, plural, lead);
  const det = artFor(forms, plural, lead);
  const drops = det === 'des' || (forms['uncountable'] === '1' && (def === 'indefinite' || def === 'some'));
  if (!det || drops) return elidesBefore(forms, lead) ? "d'" : 'de';
  return VOWEL_START.test(det) ? `d'${det}` : `de ${det}`;
}
