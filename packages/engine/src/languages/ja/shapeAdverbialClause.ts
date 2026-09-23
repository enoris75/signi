import type { ResolvedPhrase } from '../../types.js';
import { JA_SUBORDINATORS } from './ja.consts.js';

/**
 * A Japanese adverbial clause, shaped for the conjunction it is postposed to (P09-E4): the clause,
 * with its verb in the form that conjunction takes, and the conjunction's word. The engine renders
 * the clause plain, its subject marked が, and closes it on `word` — 猫が食べる時に, 猫が食べるので.
 *
 * Two conjunctions say the order of the events themselves, and fix the tense to match whatever the
 * clause's own is: 後で follows the plain past (猫が食べた後で, "after the cat eats" as much as "ate")
 * and 前に the non-past (猫が食べる前に). 間に measures a stretch of time, which the non-past 〜ている form
 * says (猫が食べている間に); a clause that already has an aspect of its own keeps it. So does a clause
 * under a modal: 必要がある and ことができる are states already, a stretch 間に can measure, and the
 * progressive would land on the governed verb (A259) — 猫が食べる必要がある間に, not 食べている必要がある.
 */
export function shapeAdverbialClause(
  adverbial: NonNullable<ResolvedPhrase['adverbialClause']>,
): { clause: ResolvedPhrase; word: string } {
  const { word, tense, progressive } = JA_SUBORDINATORS[adverbial.conjunction];
  const { clause } = adverbial;
  const vp = clause.verbPhrase;
  if (!vp) return { clause, word };
  const aspect = progressive && vp.modals.length === 0 && (vp.aspect ?? 'neutral') === 'neutral'
    ? 'progressive' as const
    : vp.aspect;
  return {
    clause: { ...clause, verbPhrase: { ...vp, tense: tense ?? vp.tense, aspect } },
    word,
  };
}
