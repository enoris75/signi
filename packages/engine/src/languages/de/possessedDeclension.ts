import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';

/**
 * The determiner a German noun phrase's adjectives decline after, the companion of the forms
 * `possessedHeadForms` gives its determiner builders. A pronominal possessive ("mein", "ihr",
 * "unser") fills the determiner slot as an ein-word, and an ein-word declines as "kein" does: mixed
 * endings in the singular ("mein großer Kater", "meinen großen Kater"), the weak -en in the plural and
 * the genitive ("meine großen Kater", "meiner großen Hunde"). So a possessed phrase declines as `no`.
 * Not as `indefinite`, whose plural has no article and takes the strong endings (the "meine große
 * Kater" of A174).
 *
 * Any other phrase declines after the determiner its `forms` carry, `definite` when they carry none.
 * `forms` are the head forms the determiner builder reads, and default to the phrase's own.
 */
export function possessedDeclension(np: ResolvedNounPhrase, forms: Record<string, string> = np.head.forms): string {
  if (np.possessor && isPronominalPossessor(np.possessor)) return 'no';
  return forms['definiteness'] ?? 'definite';
}
