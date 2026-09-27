import type { ConceptForms } from '../../types.js';
import { NEGATOR, NEGATIVE_BEFORE_NEGATOR, REPLACES_NEGATOR } from './sursilv.consts.js';

export interface Negation {
  /** Whether the plain negation's *buca* is said — not where a negative word denies the clause alone. */
  buca: boolean;
  /** The adverb in the slot after the finite verb, and its spelled text. */
  adverb?: ConceptForms;
  adverbText?: string;
  /** A sentence adverb that scopes over the negation: it stands before *buca*, "el maglia forsa buca". */
  lead?: string;
}

/**
 * The finite word with Sursilvan's negation after it (P04-E11 D2, the style sheet): a single ***buca***
 * right after the finite verb — "el maglia buca", "el ha buca magliau", "el sto buca ir" — and the
 * frequency adverb after that: "el maglia buca adina". Nothing precedes the verb. A negative adverb
 * works the slot itself:
 *
 * - *mai* (NEVER) takes *buca*'s place: "el maglia mai" (style sheet);
 * - *pli* (NO_LONGER) follows it: "el maglia buca pli" (style sheet);
 * - *aunc*, ALREADY's negative, precedes it: "el ha aunc buca magliau" (not yet);
 * - *gnanc*, ALSO's, takes its place: "el maglia gnanc la miur".
 *
 * The last two *(verify)*. Unnegated, the adverb simply follows the finite verb: "el maglia adina".
 * The helper is Sursilvan's own (P04-E11 D2): nothing of RG's *na … betg* is derived here.
 */
export function negated(finite: string, n: Negation): string {
  const words: string[] = [finite, n.lead ?? ''];
  const text = n.adverbText ?? '';
  const adverb = n.adverb;
  if (adverb && text) {
    if (adverb.forms['polarity'] === 'negative') {
      if (REPLACES_NEGATOR.has(adverb.conceptId)) words.push(text);
      else words.push(NEGATOR, text);
    } else if (n.buca && NEGATIVE_BEFORE_NEGATOR.has(text)) words.push(text, NEGATOR);
    else if (n.buca && REPLACES_NEGATOR.has(text)) words.push(text);
    else words.push(n.buca ? NEGATOR : '', text);
  } else if (n.buca) words.push(NEGATOR);
  return words.filter(Boolean).join(' ');
}
