import type { ResolvedQuestion, RubySegment } from '../../types.js';

/**
 * The Japanese question word of an adverbial gap (P09-E6): どうやって for the manner — "by doing
 * what", the question about a means that どう alone would ask about a state — and なぜ for the cause.
 * They take no particle and stand in the adverb's place, after the topic and ahead of the rest of the
 * predicate: 猫はなぜ食べ物を食べますか. The noun gaps are `questionNoun`'s; this is empty for them, and
 * for the manner of the copula, which is the predicate's どう there (猫はどうですか).
 */
export function questionAdverb(question: ResolvedQuestion | undefined, copula = false): RubySegment[] {
  if (question?.role === 'manner') return copula ? [] : [{ t: 'どうやって' }];
  if (question?.role === 'cause') return [{ t: 'なぜ' }];
  return [];
}
