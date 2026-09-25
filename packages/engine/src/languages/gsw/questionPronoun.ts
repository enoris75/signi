import type { Case } from './gsw.types.js';

// *wer* for nominative and accusative alike (P10 D7), the dative *wem* (verify at E14 whether Zürich
// keeps an accusative *wän*);
// a genitive slot asks with the dative, as the possessor dative does (*wem sis Huus?*, P10-E12).
const WER: Record<Case, string> = { nom: 'wer', acc: 'wer', dat: 'wem', gen: 'wem' };

/**
 * The German question pronoun in a noun slot's case (P09-E6, P09-E15): *wer* declined for a person —
 * *wer*, *wen*, *wem*, *wessen* — and *was*, which does not decline, for a thing. `forms` are the
 * slot's stand-in's; its `animate` says which.
 */
export function questionPronoun(forms: Record<string, string>, _case: Case): string {
  return forms['animate'] === '1' ? WER[_case] : 'was';
}
