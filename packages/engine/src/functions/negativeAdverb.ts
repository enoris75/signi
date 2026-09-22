import type { ConceptForms } from '../types.js';

/**
 * Where an adverb that scopes OVER the clause's negation stands, when its own position is not
 * already outside it:
 * - `pre-negation` — ahead of the whole negated verb group ("still does not eat"). Spanish puts a
 *   negative word there instead of the clause's "no", which is its ordinary concord ("tampoco come").
 * - `pre-negator` — immediately in front of the negator word, wherever the language puts it:
 *   "noch nicht", "auch nicht", "também não", "ne mange toujours pas".
 * - `final` — at the end of the clause, where English postposes its NPI ("does not eat it either").
 */
export type NegativeAdverbSlot = 'pre-negation' | 'pre-negator' | 'final';

/**
 * The surface and slot an adverb takes under a negation, or undefined where it keeps both. Six of
 * the seven languages spell a focus adverb differently once the clause is denied — English
 * postposed *either*, Italian *neanche*, French *non plus* and *toujours*, Spanish *tampoco* — and
 * three of them move it as well (A244, A245). The lexeme names what changes: `negative` the word,
 * `negative_slot` the position; either alone is enough, and a language that needs neither says
 * nothing and keeps the adverb exactly where the affirmative clause puts it.
 */
export function negativeAdverb(
  modifier: ConceptForms | undefined,
  negated: boolean,
): { text: string; slot?: NegativeAdverbSlot } | undefined {
  if (!modifier || !negated) return undefined;
  const f = modifier.forms;
  const slot = f['negative_slot'] as NegativeAdverbSlot | undefined;
  if (!f['negative'] && !slot) return undefined;
  return { text: f['negative'] ?? f['base'] ?? '', slot };
}
