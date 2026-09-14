import type { ConceptForms, ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../resolved/adjDegree.js';
import { PRENOMINAL } from './it.consts.js';

/** Split a phrase's adjectives into those that precede the noun and those that follow. */
export function splitAdjectives(np: ResolvedNounPhrase): { pre: ConceptForms[]; post: ConceptForms[] } {
  const pre: ConceptForms[] = [];
  const post: ConceptForms[] = [];
  for (const a of np.adjectives) {
    // A comparative/superlative adjective is postnominal in Italian ("il gatto più grande"),
    // even when its plain form would precede the noun — this also avoids article-elision
    // artefacts ("l'ugualmente grande gatto").
    const prenominal = PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive';
    (prenominal ? pre : post).push(a);
  }
  return { pre, post };
}
