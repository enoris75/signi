import { isFrequencyAdverb, type ResolvedModal } from '../../types.js';

/** A modal link's own adverb for the generic (non-finite) chain: frequency before, manner after. */
export function modalAdverbEn(m: ResolvedModal): { pre?: string; post?: string } {
  const t = m.modifier?.forms['base'] ?? '';
  if (!t) return {};
  return isFrequencyAdverb(m.modifier) ? { pre: t } : { post: t };
}
