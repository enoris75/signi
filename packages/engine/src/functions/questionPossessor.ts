import type { PronominalPossessor, ResolvedNounElement, ResolvedNounPhrase, ResolvedPhrase, ResolvedQuestion } from '../types.js';
import { objectPreposition } from './objectPreposition.js';

/**
 * The possessor a **possessor** wh-question puts on the noun it asks about (P09-E14): a stand-in with
 * no word and no concept, marked `question`, which each engine's possessor renderer writes as its
 * question word where the genitive would go — *whose* in the Saxon slot ("whose food"), *wessen* in
 * the determiner's ("wessen Essen"), *di chi* / *de qui* / *de quién* / *de quem* after the noun, 誰
 * before の. It is always a **person** (`animate`, `human`): *whose* asks for an owner, and the
 * inanimate one ("the end of what?") is the part-whole relation, which the translator refuses.
 */
export function questionPossessor(): ResolvedNounPhrase {
  return {
    head: { conceptId: '', forms: { definiteness: 'bare', question: '1', animate: '1', human: '1', gender: 'masc', number: 'singular' } },
    adjectives: [],
    nounModifiers: [],
  };
}

/** Whether a resolved possessor is the question stand-in `questionPossessor` builds. */
export function isQuestionPossessor(possessor: ResolvedNounPhrase | PronominalPossessor | undefined): boolean {
  return !!possessor && 'head' in possessor && possessor.head.forms['question'] === '1';
}

/**
 * The direct object a Romance possessor question leaves behind when its *de*-phrase fronts alone
 * (P09-E14): the possessed noun, definite, with the question stand-in taken off it — "di chi mangia
 * **il cibo** il gatto?". `el` unchanged for any other question, and for a possessor question
 * over the subject, which fronts nothing.
 */
export function withoutQuestionPossessor(
  el: ResolvedNounElement | undefined, question: ResolvedQuestion | undefined,
): ResolvedNounElement | undefined {
  if (!el || question?.role !== 'possessor' || question.possessed !== 'directObject') return el;
  return { ...el, conjuncts: el.conjuncts.map(({ possessor, ...np }) => (isQuestionPossessor(possessor) ? np : { ...np, possessor })) };
}

/**
 * The object a Romance possessor question fronts **whole**, preposition and all, with the preposition
 * its verb takes it with (`object_prep`), and that preposition — or `undefined` where the *de*-phrase
 * fronts alone (P09-E14). Romance cannot strand a preposition nor extract from the phrase it heads, so
 * "whose house does the cat depend on?" is "dalla casa di chi dipende il gatto?", never "*di chi
 * dipende dalla casa". The engine renders the phrase through its own `prepObjectText` and leaves the
 * object slot empty.
 */
export function possessedPrepObject(phrase: ResolvedPhrase): { np: ResolvedNounPhrase; prep: string } | undefined {
  const q = phrase.question;
  if (q?.role !== 'possessor' || q.possessed !== 'directObject' || !phrase.directObject || !phrase.verbPhrase) return undefined;
  const prep = objectPreposition(phrase.verbPhrase.verb);
  return prep ? { np: phrase.directObject.conjuncts[0], prep } : undefined;
}
