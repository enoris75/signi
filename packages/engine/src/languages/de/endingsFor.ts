import type { Case, Slot } from './de.types.js';
import { MIXED_ENDINGS, STRONG_DAT, STRONG_ENDINGS, STRONG_GEN, WEAK_ENDINGS } from './de.consts.js';

// Pick the ending table for a case + determiner. In the dative a *bare* phrase declines
// strong (the adjective carries the case); every other dative determiner — definite,
// ein-/kein- (mixed → -en), and einige/viele/wenige/alle — takes the invariant weak -en.
// In nom/acc an indefinite *plural* has no article, so it declines strong like a bare phrase.
//   • kein- ("no")      → like ein-: mixed in the singular, weak in the plural.
//   • einige/viele/wenige (some/many/few) → strong (no article carries the case).
//   • alle ("all"), dies-/jen- (this/that) and the definite article → weak: they are
//     der-words, carrying the case/gender ending themselves.
//   • P09-E25: mehrere (several) and the invariant genug (enough) → strong, like einige; "so ein"
//     (singular such) → mixed, like ein-; jed-, beide, "die meisten" and solch- → weak.
export function endingsFor(_case: Case, definiteness: string, plural: boolean): Record<Slot, string> {
  // "genug" carries no case at all, so the adjective after it declines strong in the dative too.
  if (_case === 'dat') return definiteness === 'bare' || definiteness === 'enough' ? STRONG_DAT : WEAK_ENDINGS.dat;
  // The genitive collapses weak and mixed alike to -en, so only a phrase with no article at all
  // declines strong: a bare one, the article-less quantifiers, and the indefinite plural.
  if (_case === 'gen') {
    const articleless =
      definiteness === 'bare' ||
      definiteness === 'some' || definiteness === 'many' || definiteness === 'few' ||
      definiteness === 'several' || definiteness === 'enough' ||
      (definiteness === 'indefinite' && plural);
    return articleless ? STRONG_GEN : WEAK_ENDINGS.gen;
  }
  if (definiteness === 'bare') return STRONG_ENDINGS[_case];
  if (definiteness === 'indefinite') return plural ? STRONG_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'such' && !plural) return MIXED_ENDINGS[_case];
  if (definiteness === 'no') return plural ? WEAK_ENDINGS[_case] : MIXED_ENDINGS[_case];
  if (definiteness === 'some' || definiteness === 'many' || definiteness === 'few' ||
      definiteness === 'several' || definiteness === 'enough')
    return STRONG_ENDINGS[_case];
  return WEAK_ENDINGS[_case]; // 'all', 'this', 'that' and 'definite'
}
