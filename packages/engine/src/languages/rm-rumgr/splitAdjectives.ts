import type { ConceptForms, ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { hasIntensifier } from '../../functions/hasIntensifier.js';
import { PRENOMINAL_DETERMINER } from './rumgr.consts.js';

/**
 * Split a phrase's adjectives into those that precede the noun and those that follow (P04 §2.1: after
 * the noun by default). An adjective precedes where its lexeme says `position: 'pre'` (*grond, bun,
 * bel, vegl* and the determiner-like *emprim, auter, medem* …, P04-E4).
 *
 * As in the `it` engine this was forked from, one *qualifying* adjective takes the slot before the
 * noun, the first in the plan's own list, and a later one follows it: "in bel giat grond" (verify). A
 * determiner-like one (`PRENOMINAL_DETERMINER`) does not compete for that slot: "in auter grond giat".
 * A compared or intensified adjective follows the noun ("il giat pli grond"), and the one carrying a
 * standard of comparison goes last, so the standard can follow it (P09-E18).
 */
export function splitAdjectives(np: ResolvedNounPhrase): { pre: ConceptForms[]; post: ConceptForms[] } {
  const pre: ConceptForms[] = [];
  const post: ConceptForms[] = [];
  let qualified = false;
  for (const a of np.adjectives) {
    const qualifying = !PRENOMINAL_DETERMINER.has(a.conceptId);
    const prenominal = a.forms['position'] === 'pre' && adjDegree(a) === 'positive' && !hasIntensifier(a) && !(qualifying && qualified);
    if (prenominal && qualifying) qualified = true;
    (prenominal ? pre : post).push(a);
  }
  const compared = post.findIndex((a) => attributiveStandard(np, a) !== undefined);
  if (compared >= 0) post.push(...post.splice(compared, 1));
  return { pre, post };
}
