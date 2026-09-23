import type { ResolvedNounElement, ResolvedQuestion } from '../../types.js';

/**
 * The subject a **subject** wh-question agrees with, in place of the throwaway its plan carries
 * (P09-E6): no word of its own — every engine writes the question word there instead — and the third
 * singular, which is what *who* and *what* agree in across the seven ("who eats", "chi mangia", "wer
 * isst", "quién come"). It is no pronoun, so no pro-drop language drops it. It carries the gap's
 * animacy where a head noun would, which is what the Japanese existential reads (誰がいますか, 何が
 * ありますか, see `isAnimate`).
 */
export function questionSubject(question: ResolvedQuestion): ResolvedNounElement {
  return {
    conjuncts: [{
      head: { conceptId: '', forms: { definiteness: 'bare', ...(question.animate ? { animate: '1', human: '1' } : {}) } },
      adjectives: [],
      nounModifiers: [],
    }],
    agreement: { person: '3', number: 'singular', gender: 'masc' },
  };
}
