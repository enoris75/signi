import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericBound } from '../../functions/boundPossessor.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { KEPT_BESIDE_POSSESSIVE } from '../../possessive.js';
import { isPlural } from './isPlural.js';

/**
 * `possessedHeadForms` for Italian. A possessive rides on the definite article ("il mio cane",
 * "nella mia casa"), except before a singular, unmodified kinship noun, where it stands alone:
 * "mio padre", "a tuo padre". The article comes back with "loro" ("il loro padre"), in the plural
 * ("i miei padri") and with an adjective or a noun modifier ("il mio vecchio padre").
 *
 * A determiner of the head's own keeps its slot, because Italian simply stacks the two: "questo suo
 * libro", "alcuni suoi libri", "nessun suo libro" and — the article included — "tutti i suoi libri"
 * (A187). `renderNP` puts the possessive straight after whatever `artFor` or `prepDet` makes of
 * these forms, so `all` belongs in the list here even though the other languages prefix a bare
 * quantifier instead ("tous ses livres", "alle ihre Bücher") and let the possessive have the slot.
 * As with a possessed name, `proper` is dropped so the determiner is the one the user picked.
 *
 * The indefinite article stacks the same way, "un mio amico" (A277) — but only where Italian writes
 * one. A plural or a mass indefinite has no article ("amici", "acqua"), and a possessive with
 * nothing in front of it is no Italian noun phrase ("*miei amici corrono"), so those keep the
 * definite article the possessive rides on: "i miei amici".
 *
 * In address (the `vocative` form `resolveAddress` sets) there is no article to ride on: "Mio amico,
 * corri", "Miei nonni, correte" (A336). "Loro" keeps its article there too, as it does everywhere.
 */
// `most` too, whose partitive's own article carries the possessive: "la maggior parte dei suoi gatti".
const IT_KEPT_BESIDE_POSSESSIVE: ReadonlySet<string> = new Set([...KEPT_BESIDE_POSSESSIVE, 'all', 'most']);

function keepsOwnDeterminer(forms: Record<string, string>): boolean {
  const definiteness = forms['definiteness'] ?? 'definite';
  if (definiteness === 'indefinite') return !isPlural(forms) && forms['uncountable'] !== '1';
  // A numeral that took the indefinite's place is written where the article would be, so the
  // possessive stacks after it as after "un": "due miei amici", and at one "un mio amico" (A329).
  if (definiteness === 'bare') return forms['indefinite_dropped'] === '1' && forms['numeral'] !== undefined;
  return IT_KEPT_BESIDE_POSSESSIVE.has(definiteness);
}

export function itPossessedHeadForms(np: ResolvedNounPhrase): Record<string, string> {
  const poss = np.possessor;
  if (poss && isPronominalPossessor(poss) && keepsOwnDeterminer(np.head.forms)) {
    const { proper: _name, ...forms } = np.head.forms;
    return forms;
  }
  const loro = !!poss && isPronominalPossessor(poss) && poss.person === '3' && poss.number === 'plural';
  if (np.head.forms['vocative'] === '1' && poss && isPronominalPossessor(poss) && !loro) return possessedHeadForms(np, 'bare');
  const bare = !!poss && isPronominalPossessor(poss)
    && np.head.forms['kinship'] === '1'
    && !isPlural(np.head.forms)
    && np.adjectives.length === 0
    && np.nounModifiers.length === 0
    && !loro
    // The generic subject's *proprio* takes the article back, "la propria madre" (A332).
    && !isGenericBound(poss);
  return possessedHeadForms(np, bare ? 'bare' : 'definite');
}
