import type { SubordinatingConjunction } from '@signi/shared';
import type { ResolvedPhrase } from '../../types.js';

/**
 * A similative clause whose verb resumes the object its likeness gaps (localization C41). "As one
 * expects" says *expects it* — the main clause — and French does not leave that gap open: *comme on
 * attend* is "as one waits". The verb's lexeme names the pro-form (`as_clitic`) and whether the verb
 * is the pronominal one there (`as_pronominal`): EXPECT is *s'attendre à*, so the clause reads
 * *comme on s'y attend*, *comme on ne s'y attend pas*, *comme on s'y attendait*, and a pronominal
 * verb takes être in the compound past (*comme on s'y est attendu*).
 *
 * Only an `as` clause with no object of its own, on a verb whose lexeme names a clitic; every other
 * clause comes back as it is. `predicateText` writes the clitic (see ResolvedVerbPhrase.gapClitic).
 */
export function similativeGap(conjunction: SubordinatingConjunction, clause: ResolvedPhrase): ResolvedPhrase {
  const vp = clause.verbPhrase;
  const clitic = vp?.verb.forms['as_clitic'];
  if (conjunction !== 'as' || !vp || !clitic || clause.directObject || clause.contentObject) return clause;
  const pronominal = vp.verb.forms['as_pronominal'] === '1';
  return {
    ...clause,
    verbPhrase: {
      ...vp,
      verb: pronominal ? { ...vp.verb, forms: { ...vp.verb.forms, aux: 'be' } } : vp.verb,
      gapClitic: { clitic, pronominal },
    },
  };
}
