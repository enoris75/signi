import type { JaIPN } from './ja.types.js';

/** Imperative person key from a subject: 1st-plural cohortative, else 2nd person. */
export function jaImperativePN(forms: Record<string, string>): JaIPN {
  const person = forms['person'] ?? '2';
  const plural = (forms['number'] ?? 'singular') === 'plural';
  return person === '1' ? '1pl' : plural ? '2pl' : '2sg';
}
