import { adjDegree, type ResolvedNounPhrase } from '../../types.js';
import type { EsAdjectives } from './es.types.js';
import { PRENOMINAL } from './es.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { apocopate } from './apocopate.js';
import { coordinate } from './coordinate.js';
import { esDeg } from './esDeg.js';
import { isPlural } from './isPlural.js';

/** Agree a noun phrase's adjectives with the head's gender/number and split them around it. */
export function esAdj(np: ResolvedNounPhrase): EsAdjectives {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = isPlural(np.head.forms);
  const pre: string[] = [];
  const post: string[] = [];
  for (const a of np.adjectives) {
    const surface = agreeAdj(a.forms['base'] ?? '', gender, plural);
    if (!surface) continue;
    // A comparative/superlative follows the noun even when its plain form precedes it ("el
    // primer gato" but "el gato más primero"), as its degree adverb belongs with the phrase.
    if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive') {
      pre.push(apocopate(a.conceptId, surface, gender, plural));
    } else {
      post.push(esDeg(a, surface));
    }
  }
  return { pre: pre.join(' '), post: coordinate(post) };
}
