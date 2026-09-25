import type { Degree, NounPhrase } from '@signi/shared';
import type { ResolvedNounElement } from '../../types.js';
import { STANDARD_DEGREES, SUPERLATIVE_DEGREES } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveNounElement } from './resolveNounElement.js';

/**
 * Resolve the one attributive standard of comparison a noun phrase renders ("a bigger cat **than the
 * dog**", P09-E18) or the one set of an attributive superlative ("the biggest house **in the city**",
 * P09-E19, A371), with the **plan** index of the adjective it belongs to, or nothing. `domain` says it
 * is a set.
 *
 * `adjectiveStandards` is index-aligned with `adjectives`, but at most one renders: the first whose
 * adjective's degree measures against something — the comparatives and the equative
 * (`STANDARD_DEGREES`), which take a standard, and the superlatives (`SUPERLATIVE_DEGREES`), which
 * take a set — and whose entry is set. A standard on a `positive` adjective has nothing to compare,
 * and a second compared adjective's is dropped because no language stacks two ("a bigger-than-the-dog
 * more-beautiful-than-the-fox cat"). The caller marks that adjective `standard: '1'`, or `domain: '1'`
 * for a set, as `resolveStandard` marks a head.
 */
export function resolveAdjectiveStandard(
  np: NounPhrase,
  language: string,
  lookup: LexiconLookup,
): { planIndex: number; standard: ResolvedNounElement; domain: boolean } | undefined {
  const measures = (degree: Degree) => STANDARD_DEGREES.has(degree) || SUPERLATIVE_DEGREES.has(degree);
  const planIndex = (np.adjectives ?? []).findIndex((_, i) =>
    np.adjectiveStandards?.[i] !== undefined && measures(np.adjectiveDegrees?.[i] ?? 'positive'));
  const element = planIndex < 0 ? undefined : np.adjectiveStandards?.[planIndex];
  if (!element) return undefined;
  const domain = SUPERLATIVE_DEGREES.has(np.adjectiveDegrees?.[planIndex] ?? 'positive');
  return { planIndex, standard: resolveNounElement(element, language, lookup), domain };
}
