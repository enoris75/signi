import type { Tense } from '@signi/shared';

/**
 * The auxiliary *do* that a verb group with no auxiliary of its own takes when it is questioned or
 * negated, agreeing with the subject: "**does** the cat eat?", "**did** the cat have to go?", "the cats
 * **do** not want to go". The verb after it takes its bare form.
 */
export function doSupport(subjectForms: Record<string, string>, tense: Tense): string {
  if (tense === 'past') return 'did';
  const person = subjectForms['person'] ?? '3';
  const singular = (subjectForms['number'] ?? 'singular') !== 'plural';
  return person === '3' && singular ? 'does' : 'do';
}
