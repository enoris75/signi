import type { ConceptForms, ResolvedModal } from '../types.js';
import { isNegativeAdverb } from './isNegativeAdverb.js';

/**
 * Does the MAIN verb's adverb carry negative polarity **under a modal**? A negative adverb is its
 * own negator, and it denies the verb it modifies — so a NEVER written on the main verb of a modal
 * clause denies the governed group, not the finite modal: "the cat wants to never eat" is a
 * different plan from "the cat never wants to eat" (A236).
 *
 * It is the adverb's half of `governedNegative`, the inner negation A03 built: a language that
 * writes one reads both together ("vuole non mangiare mai", "veut ne jamais manger",
 * 決して食べないでいたいです). English and German need neither — English places the adverb inside the
 * governed group already ("wants to never eat"), and a single German "nie" in a modal cluster takes
 * either scope — so they keep reading `groupHasNegativeAdverb` and their own `governedNegative`.
 */
export function governedHasNegativeAdverb(vp: {
  modifier?: ConceptForms;
  modals: ResolvedModal[];
}): boolean {
  return vp.modals.length > 0 && isNegativeAdverb(vp.modifier);
}
