import type { ResolvedNounElement, ResolvedQuestion } from '../../types.js';
import { questionAdverbial } from '../../functions/questionAdverbial.js';

/**
 * The Japanese question word of a noun gap, as the noun that fills it (P09-E6): 誰 (だれ) for a person
 * and 何 (なに) for a thing over the subject or the object, どこ over the locative. Japanese moves
 * nothing in a wh-question, so the word is simply the noun the slot would have held, and every
 * particle the slot takes follows from that: 誰が, 何を — or the verb's own object particle, 誰に会います
 * — and the locative's で, or に under the existential (どこにいますか). The manner and the cause are
 * adverbs rather than nouns (see `questionAdverb`), so they have none here — except the manner of
 * the **copula**, "how is the cat?", which asks for the predicate itself and is どう in the predicate's
 * slot: 猫はどうですか, never 「どうやっていますか」 (`copula`).
 *
 * A complement gap in any other relation is 何 / 誰 in that complement's slot, which gives it the
 * relation's own particle or relational noun (P09-E15): 何の下で, 誰のおかげで, 何で, 誰に, 何について,
 * and the negative cause's 誰のせいで. A plain direction or source is どこ there (どこへ, どこから), and
 * *until when* いつ (いつまで); a plain *when* takes no particle at all, so it is `questionAdverb`'s.
 */
export function questionNoun(question: ResolvedQuestion, copula = false): ResolvedNounElement | undefined {
  const adverb = questionAdverbial(question);
  // A place gone through, in no relation of its own, is どこ too: 猫はどこを走りますか, where 何を would
  // read as the object's question.
  const route = question.role === 'route' && !question.animate && !question.specifiers?.some((s) => s.kind === 'path');
  const forms: Record<string, string> | undefined = adverb === 'where' || adverb === 'whereTo' || adverb === 'whereFrom' || route
    ? { base: 'どこ' }
    : adverb === 'untilWhen' ? { base: 'いつ' }
    : question.role === 'manner' ? (copula ? { base: 'どう' } : undefined)
    : adverb === 'why' || adverb === 'when' || question.role === 'possessor' ? undefined
    : question.animate ? { base: '誰', reading: 'だれ', animate: '1', human: '1' } : { base: '何', reading: 'なに' };
  if (!forms) return undefined;
  return {
    conjuncts: [{ head: { conceptId: '', forms: { ...forms, definiteness: 'bare' } }, adjectives: [], nounModifiers: [] }],
    agreement: { person: '3', number: 'singular' },
  };
}
