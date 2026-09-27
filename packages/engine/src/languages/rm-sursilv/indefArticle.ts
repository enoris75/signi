import { VOWEL_START } from './sursilv.consts.js';

/**
 * The indefinite article (style sheet): *in* (m), *ina* (f), the feminine eliding to *in'* before a
 * vowel ("in'aura"); none in the plural ("gats"). `lead` is the word that follows it.
 */
export function indefArticle(forms: Record<string, string>, plural: boolean, lead?: string): string {
  if (plural) return '';
  if ((forms['gender'] ?? 'masc') !== 'fem') return 'in';
  return lead !== undefined && VOWEL_START.test(lead) ? "in'" : 'ina';
}
