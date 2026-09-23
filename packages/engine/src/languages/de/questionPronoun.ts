import type { Case } from './de.types.js';

const WER: Record<Case, string> = { nom: 'wer', acc: 'wen', dat: 'wem', gen: 'wessen' };

/**
 * The German question pronoun in a noun slot's case (P09-E6, P09-E15): *wer* declined for a person —
 * *wer*, *wen*, *wem*, *wessen* — and *was*, which does not decline, for a thing. `forms` are the
 * slot's stand-in's; its `animate` says which.
 */
export function questionPronoun(forms: Record<string, string>, _case: Case): string {
  return forms['animate'] === '1' ? WER[_case] : 'was';
}
