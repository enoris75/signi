import { isFrequencyAdverb, type ResolvedModal } from '../../types.js';

/**
 * A modal link's own adverb for the generic (non-finite) chain: a frequency adverb before it
 * ("would always want to eat"). A manner adverb has no slot between a modal and the verb it governs
 * ("*can fast eat"), so it is left out here and trails the clause instead (see `predicateParts`).
 */
export function modalAdverbEn(m: ResolvedModal): { pre?: string; post?: string } {
  const t = m.modifier?.forms['base'] ?? '';
  if (!t || !isFrequencyAdverb(m.modifier)) return {};
  return { pre: t };
}
