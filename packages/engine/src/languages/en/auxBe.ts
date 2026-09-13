import type { Tense } from '@signi/shared';

/**
 * The auxiliary "be", conjugated for tense + subject, as its word(s): "am"/"is"/"are",
 * "was"/"were", "will be". Drives the progressive and prospective, and the resultative of
 * the few verbs that select it ("is gone").
 */
export function auxBe(subjectForms: Record<string, string>, tense: Tense): string[] {
  const person = subjectForms['person'] ?? '3';
  const singular = (subjectForms['number'] ?? 'singular') !== 'plural';
  if (tense === 'future') return ['will', 'be'];
  if (tense === 'past') return [singular && (person === '1' || person === '3') ? 'was' : 'were'];
  if (!singular) return ['are'];
  return person === '1' ? ['am'] : person === '3' ? ['is'] : ['are']; // "you are"
}
