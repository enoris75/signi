import type { NounPhrase } from '@signi/shared';
import type { ResolvedNounElement } from '../../types.js';
import { STANDARD_DEGREES } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounElement } from './resolveNounElement.js';

/**
 * Resolve the one attributive standard of comparison a noun phrase renders ("a bigger cat **than the
 * dog**", P09-E18), with the **plan** index of the adjective it belongs to, or nothing.
 *
 * `adjectiveStandards` is index-aligned with `adjectives`, but at most one renders: the first whose
 * adjective's degree takes a standard (`STANDARD_DEGREES` — the comparatives and the equative) and
 * whose entry is set. A standard on a `positive` adjective has nothing to compare, one on a
 * superlative would be its set, which is predicative only (P09-E19 D5), and a second compared
 * adjective's is dropped because no language stacks two ("a bigger-than-the-dog more-beautiful-than-
 * the-fox cat"). The caller marks that adjective `standard: '1'`, as `resolveStandard` marks a head.
 */
export function resolveAdjectiveStandard(
  np: NounPhrase,
  language: string,
  lookup: LexiconLookup,
): { planIndex: number; standard: ResolvedNounElement } | undefined {
  const planIndex = (np.adjectives ?? []).findIndex((_, i) =>
    np.adjectiveStandards?.[i] !== undefined && STANDARD_DEGREES.has(np.adjectiveDegrees?.[i] ?? 'positive'));
  const element = planIndex < 0 ? undefined : np.adjectiveStandards?.[planIndex];
  if (!element) return undefined;
  return { planIndex, standard: resolveNounElement(element, language, lookup) };
}
