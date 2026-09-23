import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectCase } from './objectCase.js';
import { objectPrepCase } from './objectPrepCase.js';

const ADVERBIAL: Record<'locative' | 'manner' | 'cause', string> = { locative: 'wo', manner: 'wie', cause: 'warum' };
const WER: Record<'nom' | 'acc' | 'dat', string> = { nom: 'wer', acc: 'wen', dat: 'wem' };

/**
 * The German wh-word for a question's gap (P09-E6). *wer* declines, and takes the case of the slot it
 * asks about: *wer* for the subject, *wen* for an accusative object and *wem* for a dative one (the
 * verb's `object_case`, "wem hilft der Kater?"). *was* does not. A verb that takes its object with a
 * preposition asks with it — the preposition over *wen* / *wem* for a person ("auf wen wartet er?"),
 * and the *wo(r)-* compound for a thing ("worauf wartet er?"), which is what German writes where the
 * relativizer would write *auf das*. The adverbial gaps are *wo*, *wie*, *warum*.
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.role === 'subject') return question.animate ? WER.nom : 'was';
  // The possessor's word is written by the possessor renderer, in the phrase it sits in (P09-E14).
  if (question.role === 'possessor') return 'wessen';
  if (question.role !== 'directObject') return ADVERBIAL[question.role];
  const prep = objectPreposition(verb);
  if (!prep) return question.animate ? WER[objectCase(verb)] : 'was';
  if (question.animate) return `${prep} ${WER[objectPrepCase(prep)]}`;
  return /^[aeiouäöü]/.test(prep) ? `wor${prep}` : `wo${prep}`;
}
