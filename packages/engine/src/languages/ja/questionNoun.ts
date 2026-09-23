import type { ResolvedNounElement, ResolvedQuestion } from '../../types.js';

/**
 * The Japanese question word of a noun gap, as the noun that fills it (P09-E6): 誰 (だれ) for a person
 * and 何 (なに) for a thing over the subject or the object, どこ over the locative. Japanese moves
 * nothing in a wh-question, so the word is simply the noun the slot would have held, and every
 * particle the slot takes follows from that: 誰が, 何を — or the verb's own object particle, 誰に会います
 * — and the locative's で, or に under the existential (どこにいますか). The manner and the cause are
 * adverbs rather than nouns (see `questionAdverb`), so they have none here — except the manner of
 * the **copula**, "how is the cat?", which asks for the predicate itself and is どう in the predicate's
 * slot: 猫はどうですか, never 「どうやっていますか」 (`copula`).
 */
export function questionNoun(question: ResolvedQuestion, copula = false): ResolvedNounElement | undefined {
  const forms: Record<string, string> | undefined = question.role === 'locative' ? { base: 'どこ' }
    : question.role === 'manner' ? (copula ? { base: 'どう' } : undefined)
    : question.role === 'cause' ? undefined
    : question.animate ? { base: '誰', reading: 'だれ', animate: '1', human: '1' } : { base: '何', reading: 'なに' };
  if (!forms) return undefined;
  return {
    conjuncts: [{ head: { conceptId: '', forms: { ...forms, definiteness: 'bare' } }, adjectives: [], nounModifiers: [] }],
    agreement: { person: '3', number: 'singular' },
  };
}
