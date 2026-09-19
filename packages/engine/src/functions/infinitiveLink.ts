import type { ResolvedPhrase } from '../types.js';
import { firstConjunct } from './firstConjunct.js';

/**
 * The word linking a clause's infinitive complement (see PhrasePlan.infinitiveComplement) to the word
 * that governs it: its predicate adjective when it has one — it "capace **di** agire", "obbligato **a**
 * agire" — else its verb, "desiderare agire". It is lexical, so the governor's lexeme names it
 * (`infinitive_link`); "" is the bare infinitive. The Japanese entry is the particle after the こと
 * clause (行動すること**が**可能 / 行動すること**を**望む). English and German always link with "to" / "zu"
 * and do not read it.
 */
export function infinitiveLink(phrase: ResolvedPhrase): string {
  const predicative = phrase.complements?.['predicative'];
  const governor = predicative ? firstConjunct(predicative.phrase).head.forms : phrase.verbPhrase?.verb.forms;
  return governor?.['infinitive_link'] ?? '';
}
