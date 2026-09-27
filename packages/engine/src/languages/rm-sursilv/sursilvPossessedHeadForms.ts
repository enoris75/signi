import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { KEPT_BESIDE_POSSESSIVE } from '../../possessive.js';
import { isPlural } from './isPlural.js';

/**
 * `possessedHeadForms` for Sursilvan. The possessive takes no article (P04 §2.1, E7 D4):
 * "mes gat", "mia casa", "a mes gat", "en mia casa" — kinship noun or not, singular or plural,
 * *lur* included. A determiner of the head's own keeps its slot, and the possessive stacks after it
 * as it did in the RG engine this was forked from: "quest mes cudisch", "in mes ami", "negin ses
 * cudisch" (verify). A plural or a mass indefinite has no article to stack on, so it goes bare: "mes
 * amis".
 */
const SURSILV_KEPT_BESIDE_POSSESSIVE: ReadonlySet<string> = new Set([...KEPT_BESIDE_POSSESSIVE, 'all', 'most']);

function keepsOwnDeterminer(forms: Record<string, string>): boolean {
  const definiteness = forms['definiteness'] ?? 'definite';
  if (definiteness === 'indefinite') return !isPlural(forms) && forms['uncountable'] !== '1';
  // A numeral that took the indefinite's place is written where the article would be (A329): "dus mes amis".
  if (definiteness === 'bare') return forms['indefinite_dropped'] === '1' && forms['numeral'] !== undefined;
  return SURSILV_KEPT_BESIDE_POSSESSIVE.has(definiteness);
}

export function sursilvPossessedHeadForms(np: ResolvedNounPhrase): Record<string, string> {
  const poss = np.possessor;
  if (!poss || !isPronominalPossessor(poss)) return possessedHeadForms(np, 'definite');
  if (keepsOwnDeterminer(np.head.forms)) {
    const { proper: _name, ...forms } = np.head.forms;
    return forms;
  }
  return possessedHeadForms(np, 'bare');
}
