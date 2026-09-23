import type { ConceptForms, ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { hasIntensifier } from '../../functions/hasIntensifier.js';
import { PRENOMINAL, PRENOMINAL_QUALIFYING } from './it.consts.js';

/**
 * Split a phrase's adjectives into those that precede the noun and those that follow.
 *
 * Italian takes at most **one** qualifying adjective before the noun, so the first eligible one in
 * the phrase's own list keeps that slot and every later one joins `post` — "il bel gatto grande",
 * not "*il bel grande gatto" (A145). The list order is the user's, and nothing else in the engine
 * reorders it, so "first wins" is the predictable rule. The demoted adjectives land in the
 * postnominal list and are coordinated by `joinConjuncts` for free ("vecchio e bello", A27).
 *
 * A determiner-like prenominal (an ordinal, OTHER) does not qualify the noun, so it does not take
 * that slot and does not stop a qualifying adjective from taking it: "un altro grande topo".
 *
 * The compared adjective that carries a standard (P09-E18) moves **last** among the postnominal ones,
 * so its standard can follow it without attaching to another adjective: "un gatto marrone e più grande
 * del cane", whatever order the plan listed them in.
 */
export function splitAdjectives(np: ResolvedNounPhrase): { pre: ConceptForms[]; post: ConceptForms[] } {
  const pre: ConceptForms[] = [];
  const post: ConceptForms[] = [];
  let qualified = false;
  for (const a of np.adjectives) {
    // A comparative/superlative adjective is postnominal in Italian ("il gatto più grande"),
    // even when its plain form would precede the noun — this also avoids article-elision
    // artefacts ("l'ugualmente grande gatto"). An intensifier moves it the same way (C33).
    const qualifying = PRENOMINAL_QUALIFYING.has(a.conceptId);
    const prenominal = PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive' && !hasIntensifier(a) && !(qualifying && qualified);
    if (prenominal && qualifying) qualified = true;
    (prenominal ? pre : post).push(a);
  }
  const compared = post.findIndex((a) => attributiveStandard(np, a) !== undefined);
  if (compared >= 0) post.push(...post.splice(compared, 1));
  return { pre, post };
}
