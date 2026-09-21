import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement } from '../types.js';
import { causeNegative } from './causeNegative.js';

/**
 * A rendered complement with its own negator in front, where the plan denies the cause rather than
 * the clause: "not because of the dog", "non a causa del cane", "nicht wegen des Hundes" (see
 * `Complement.negative`).
 *
 * The negator goes immediately before the whole cause phrase, whatever shape the sentiment gave it
 * — the neutral connector, the credit ("thanks to") or the blame ("through the fault of") — because
 * what is denied is that this was the reason, not the stance taken on it. The clause's own
 * negation is untouched: both may stand ("ist nicht wegen des Hundes nicht müde").
 *
 * Applied where each engine has already rendered the complement, so it needs to know nothing about
 * how that language spells its cause. Japanese negates with a suffix instead and does it in
 * `complementSegs`.
 */
export function withCauseNegator(
  text: string,
  type: ComplementType,
  c: ResolvedComplement | undefined,
  negator: string,
): string {
  return text && type === 'cause' && causeNegative(c) ? `${negator} ${text}` : text;
}
