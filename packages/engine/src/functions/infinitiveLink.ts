import type { ResolvedPhrase } from '../types.js';
import { firstConjunct } from './firstConjunct.js';

/**
 * The word linking a clause's infinitive complement (see PhrasePlan.infinitiveComplement) to the word
 * that governs it: its predicate adjective when it has one — it "capace **di** agire", "obbligato **a**
 * agire" — else its verb, "desiderare agire". It is lexical, so the governor's lexeme names it
 * (`infinitive_link`); "" is the bare infinitive. The Japanese entry is the whole tail that closes
 * the nominalized clause — 行動する**ことが**可能 / 行動する**ことを**望む, and 見る**ように**する for the
 * causative, which nominalizes with よう in place of こと (the ja engine defaults to ことを). English
 * and German always link with "to" / "zu" and do not read it.
 *
 * A negated complement whose governor names a link of its own for it takes that one, which carries
 * the negation: Spanish "sigue **sin** correr" (see `ResolvedVerbPhrase.negativeLink`, A315).
 */
export function infinitiveLink(phrase: ResolvedPhrase): string {
  const negativeLink = phrase.infinitiveComplement?.verbPhrase?.negativeLink;
  if (negativeLink) return negativeLink;
  const predicative = phrase.complements?.['predicative'];
  const governor = predicative ? firstConjunct(predicative.phrase).head.forms : phrase.verbPhrase?.verb.forms;
  return governor?.['infinitive_link'] ?? '';
}
