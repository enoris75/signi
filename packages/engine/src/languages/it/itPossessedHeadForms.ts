import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../resolved/possessedHeadForms.js';
import { isPlural } from './isPlural.js';

/**
 * `possessedHeadForms` for Italian. A possessive rides on the definite article ("il mio cane",
 * "nella mia casa"), except before a singular, unmodified kinship noun, where it stands alone:
 * "mio padre", "a tuo padre". The article comes back with "loro" ("il loro padre"), in the plural
 * ("i miei padri") and with an adjective or a noun modifier ("il mio vecchio padre").
 */
export function itPossessedHeadForms(np: ResolvedNounPhrase): Record<string, string> {
  const poss = np.possessor;
  const bare = !!poss && isPronominalPossessor(poss)
    && np.head.forms['kinship'] === '1'
    && !isPlural(np.head.forms)
    && np.adjectives.length === 0
    && np.nounModifiers.length === 0
    && !(poss.person === '3' && poss.number === 'plural');
  return possessedHeadForms(np, bare ? 'bare' : 'definite');
}
