import type { ConceptForms } from '../../types.js';
import { NEGATOR, NEGATOR_POST, NEGATIVE_BEFORE_BETG, REPLACES_BETG } from './rumgr.consts.js';

/**
 * *na* before a word, *n'* before a vowel or *h* — "na mangia", "n'è", "n'ha" (P04-E11 D1, the
 * ticket's "n'ha betg mangià"; verify the *h*).
 */
export function withNa(word: string): string {
  return /^[aeiouàèéìòùh]/i.test(word) ? `n'${word}` : `${NEGATOR} ${word}`;
}

export interface Negation {
  /** Whether the clause is negated at all: *na* before the finite verb. */
  na: boolean;
  /** Whether the plain negation's *betg* is said — not where a negative word concords with *na* alone. */
  betg: boolean;
  /** The adverb in the slot after the finite verb, and its spelled text. */
  adverb?: ConceptForms;
  adverbText?: string;
  /** A sentence adverb that scopes over the negation and so leads it: "forsa na". */
  lead?: string;
}

/**
 * The finite word with RG's bipartite negation around it (P04-E11, modelled on `fr`'s *ne … pas*):
 * *na* before it (and before its reflexive clitic), *betg* after it, and the frequency adverb after
 * that — "na mangia betg", "n'ha betg adina mangià". A negative adverb works the slot itself:
 *
 * - *mai* (NEVER) takes *betg*'s place: "el na vegn mai" (P04 §2.2);
 * - *pli* (NO_LONGER) follows it: "el na vegn betg pli";
 * - *anc*, ALREADY's negative, precedes it: "el n'ha anc betg mangià" (not yet);
 * - *gnanc*, ALSO's, takes its place: "el na mangia gnanc la mieur".
 *
 * All four *(verify)*. Unnegated, the adverb simply follows the finite verb: "el mangia adina".
 */
export function negated(finite: string, n: Negation): string {
  const words: string[] = [n.lead ?? ''];
  words.push(n.na ? withNa(finite) : finite);
  const text = n.adverbText ?? '';
  const adverb = n.adverb;
  if (adverb && text) {
    if (adverb.forms['polarity'] === 'negative') {
      if (REPLACES_BETG.has(adverb.conceptId)) words.push(text);
      else words.push(n.na ? NEGATOR_POST : '', text);
    } else if (n.betg && NEGATIVE_BEFORE_BETG.has(text)) words.push(text, NEGATOR_POST);
    else if (n.betg && REPLACES_BETG.has(text)) words.push(text);
    else words.push(n.betg ? NEGATOR_POST : '', text);
  } else if (n.betg) words.push(NEGATOR_POST);
  return words.filter(Boolean).join(' ');
}
