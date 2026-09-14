import type { ConceptForms, ResolvedComplement } from '../types.js';

/**
 * Whether a `predicative` complement is a predicate NOUN under a seeming verb — SEEM, whose lexemes
 * carry `seeming: '1'`. English and German take no bare predicate nominative there and add an
 * infinitival copula ("seems to be a legend", "scheint eine Legende zu sein"); the languages whose
 * seeming verb licenses one (sembrare, sembler, parecer) never ask. A predicate adjective stays bare
 * under every verb ("seems tired"), so a single noun conjunct is enough to call for the copula.
 */
export function isSeemingPredicateNoun(c: ResolvedComplement, verb: ConceptForms['forms']): boolean {
  return verb['seeming'] === '1' && c.phrase.conjuncts.some((np) => np.head.forms['role'] !== 'adjective');
}
