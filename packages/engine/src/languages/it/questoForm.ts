import { VOWEL_START } from './it.consts.js';

/**
 * The proximal demonstrative "questo", agreeing in gender/number and eliding before a vowel:
 * masc "questo"/"questi" · fem "questa"/"queste" · "quest'amico", "quest'amica" (the singulars
 * elide; the plurals never do).
 */
export function questoForm(forms: Record<string, string>, plural: boolean, lead: string): string {
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  if (plural) return fem ? 'queste' : 'questi';
  if (VOWEL_START.test(lead)) return "quest'";
  return fem ? 'questa' : 'questo';
}
