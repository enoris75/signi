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
 */
const IT_KEPT_BESIDE_POSSESSIVE: ReadonlySet<string> = new Set([...KEPT_BESIDE_POSSESSIVE, 'all']);

function keepsOwnDeterminer(forms: Record<string, string>): boolean {
  const definiteness = forms['definiteness'] ?? 'definite';
  if (definiteness === 'indefinite') return !isPlural(forms) && forms['uncountable'] !== '1';
  return IT_KEPT_BESIDE_POSSESSIVE.has(definiteness);
}

export function itPossessedHeadForms(np: ResolvedNounPhrase): Record<string, string> {
  const poss = np.possessor;
  if (poss && isPronominalPossessor(poss) && keepsOwnDeterminer(np.head.forms)) {
    const { proper: _name, ...forms } = np.head.forms;
    return forms;
  }
  const bare = !!poss && isPronominalPossessor(poss)
    && np.head.forms['kinship'] === '1'
    && !isPlural(np.head.forms)
    && np.adjectives.length === 0
    && np.nounModifiers.length === 0
    && !(poss.person === '3' && poss.number === 'plural')
    // The generic subject's *proprio* takes the article back, "la propria madre" (A332).
    && !isGenericBound(poss);
  return possessedHeadForms(np, bare ? 'bare' : 'definite');
}
