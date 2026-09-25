import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { keptBesidePossessive } from '../../possessive.js';

/**
 * The determiner a German noun phrase's adjectives decline after, the companion of the forms
 * `possessedHeadForms` gives its determiner builders. A pronominal possessive ("mein", "ihr",
 * "unser") fills the determiner slot as an ein-word, and an ein-word declines as "kein" does: mixed
 * endings in the singular ("mein großer Kater", "meinen großen Kater"), the weak -en in the plural and
 * the genitive ("meine großen Kater", "meiner großen Hunde"). So a possessed phrase declines as `no`.
 * Not as `indefinite`, whose plural has no article and takes the strong endings (the "meine große
 * Kater" of A174).
 *
 * A head that keeps a determiner of its own is the exception (A187): the possessive has moved to a
 * postnominal "von" phrase ("dieses große Buch von ihr"), so the adjectives decline after that
 * determiner like any other phrase's. "alle ihre großen Bücher" is not one of those — the possessive
 * is still the ein-word the adjectives follow — so `all` keeps declining as `no`.
 *
 * Any other phrase declines after the determiner its `forms` carry, `definite` when they carry none.
 * `forms` are the head forms the determiner builder reads, and default to the phrase's own.
 */
export function possessedDeclension(np: ResolvedNounPhrase, forms: Record<string, string> = np.head.forms): string {
  const definiteness = forms['definiteness'] ?? 'definite';
  // *wessen* is a genitive in the determiner's place that declines nothing itself, so what follows
  // it declines strong, as after any prenominal genitive: "wessen großes Essen" (P09-E14).
  // *wem sis* and a possessor dative's *sis* are possessives like *mis*, so what follows declines as it
  // does after *kei*: "em Vatter sis grosses Huus" (P10-E12).
  if (isQuestionPossessor(np.possessor) || np.head.forms['possessor_dative'] === '1') return 'no';
  if (np.possessor && isPronominalPossessor(np.possessor) && !keptBesidePossessive(forms)) return 'no';
  return definiteness;
}
