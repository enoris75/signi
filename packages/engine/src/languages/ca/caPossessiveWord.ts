import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessiveCa } from '../../possessive.js';
import { isPlural } from './isPlural.js';

/**
 * The possessive for a pronominal possessor, agreeing with this possessed head in gender and number:
 * *meu, meva, meus, meves* (P03 §0.4). The same word stands after the article ("el meu gat") and after
 * the noun beside a determiner of its own ("aquest llibre meu", "un amic meu"). Empty for a genitive
 * or absent possessor — that one is postnominal ("de") and `possessorText`'s.
 */
export function caPossessiveWord(np: ResolvedNounPhrase): string {
  const poss = np.possessor;
  if (!poss || !isPronominalPossessor(poss)) return '';
  const forms = np.head.forms;
  return possessiveCa(poss, {
    gender: (forms['gender'] ?? 'masc') as 'masc' | 'fem',
    number: isPlural(forms) ? 'plural' : 'singular',
  });
}
