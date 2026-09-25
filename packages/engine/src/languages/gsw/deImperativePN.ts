import type { DeIPN } from './gsw.types.js';

// Imperative person key from a subject: 1st-plural cohortative, else 2nd sg/pl.
export function deImperativePN(forms: Record<string, string>): DeIPN {
  const person = forms['person'] ?? '2';
  const plural = (forms['number'] ?? 'singular') === 'plural';
  return person === '1' ? '1pl' : plural ? '2pl' : '2sg';
}
