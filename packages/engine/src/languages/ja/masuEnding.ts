import type { Tense } from '@signi/shared';

/** The polite ending of a verb, by tense and polarity. Future reuses the present. */
export function masuEnding(tense: Tense, negative: boolean): string {
  if (tense === 'past') return negative ? 'ませんでした' : 'ました';
  return negative ? 'ません' : 'ます';
}
