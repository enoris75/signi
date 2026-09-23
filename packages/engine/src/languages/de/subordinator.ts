import type { ResolvedPhrase } from '../../types.js';
import { SUBORDINATORS } from './de.consts.js';

/**
 * The German word introducing an adverbial clause (see PhrasePlan.adverbialClause, P09-E4). *When*
 * is two words: "wenn" for the present and for what recurs, "als" for a single event in the past —
 * "der Mann lief, **als** der Kater das Essen fraß", where "wenn" would read "whenever". A plan does
 * not say which a past clause is, so the past takes "als", the one a narrated event takes.
 */
export function subordinator(adverbial: NonNullable<ResolvedPhrase['adverbialClause']>): string {
  return adverbial.conjunction === 'when' && adverbial.clause.verbPhrase?.tense === 'past'
    ? 'als'
    : SUBORDINATORS[adverbial.conjunction];
}
