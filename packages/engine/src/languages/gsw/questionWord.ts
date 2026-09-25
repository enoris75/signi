import type { ConceptForms, ResolvedQuestion } from '../../types.js';
import { type QuestionAdverb, questionAdverbial } from '../../functions/questionAdverbial.js';
import { questionGapComplement, questionStandIn } from '../../functions/questionGapComplement.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase/index.js';
import { woCompound } from './woCompound.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectCase } from './objectCase.js';
import { objectPrepCase } from './objectPrepCase.js';

const ADVERBIAL: Record<QuestionAdverb, string> = {
  where: 'wo', how: 'wie', why: 'wieso', whereTo: 'wohii', whereFrom: 'woher', when: 'wänn', untilWhen: 'bis wänn',
};
const WER: Record<'nom' | 'acc' | 'dat', string> = { nom: 'wer', acc: 'wer', dat: 'wem' };

/**
 * The German wh-word for a question's gap (P09-E6). *wer* declines, and takes the case of the slot it
 * asks about: *wer* for the subject, *wen* for an accusative object and *wem* for a dative one (the
 * verb's `object_case`, "wem hilft der Kater?"). *was* does not. A verb that takes its object with a
 * preposition asks with it — the preposition over *wen* / *wem* for a person ("auf wen wartet er?"),
 * and the *wo(r)-* compound for a thing ("worauf wartet er?"), which is what German writes where the
 * relativizer would write *auf das*. The adverbial gaps are *wo*, *wie*, *warum*.
 *
 * A complement gap keeps its relation (P09-E15), and German never strands it: a person is the
 * preposition over *wer* in the case it governs, through the complement path ("dank wem", "mit wem",
 * "zu wem", the bare dative *wem* of the recipient); a thing is the *wo(r)-* compound where German has
 * one ("worunter", "womit", "wodurch", see `woCompound`) and the preposition over *was* where it does
 * not ("dank was"). The negative cause is "durch wessen Schuld". A plain direction or source is *wohin*
 * / *woher*, a time *wann* or *bis wann* (`questionAdverbial`).
 */
export function questionWord(question: ResolvedQuestion, verb: ConceptForms): string {
  if (question.role === 'subject') return question.animate ? WER.nom : 'was';
  // The possessor's word is written by the possessor renderer, in the phrase it sits in (P09-E14).
  if (question.role === 'possessor') return 'wem';
  // A passive's agent asked about is the by-phrase over the stand-in (P09-E16): *von wem*, and for a thing *wovon*.
  if (question.role === 'agent') return woCompound(agentPhrase(questionStandIn(question, { base: '', definiteness: 'question' })).replace(/\s+/g, ' ').trim());
  const adverb = questionAdverbial(question);
  if (adverb) return ADVERBIAL[adverb];
  const gap = questionGapComplement(question, { base: '', definiteness: 'question' }, verb.forms);
  if (gap) {
    const word = woCompound(complementsPhrase(gap, verb.forms).replace(/\s+/g, ' ').trim());
    // *was* has no dative: a thing in the bare dative slot of a recipient asks with *wem* (A281).
    return word === 'was' && question.role === 'terminus' && verb.forms['terminus_case'] !== 'acc' ? WER.dat : word;
  }
  const prep = objectPreposition(verb);
  // … and so does the thing a dative verb takes as its object ("wem hilft der Kater?", A281).
  if (!prep) return question.animate || objectCase(verb) === 'dat' ? WER[objectCase(verb)] : 'was';
  if (question.animate) return `${prep} ${WER[objectPrepCase(prep)]}`;
  // Zürich asks a thing after a preposition with the preposition and *was* — "uf was", "mit was" — where
  // Standard German builds a *wo*-compound (*worauf*, *womit*).
  return `${prep} was`;
}
