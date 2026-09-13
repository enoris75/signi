import type { Tense } from '@signi/shared';

/** The auxiliary "have": "have"/"has", "had", "will have". */
export function auxHave(subjectForms: Record<string, string>, tense: Tense): string[] {
  const person = subjectForms['person'] ?? '3';
  const singular = (subjectForms['number'] ?? 'singular') !== 'plural';
  if (tense === 'future') return ['will', 'have'];
  if (tense === 'past') return ['had'];
  return [singular && person === '3' ? 'has' : 'have'];
}
