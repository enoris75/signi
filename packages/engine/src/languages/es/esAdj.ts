import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { hasIntensifier } from '../../functions/hasIntensifier.js';
import { possessorBeforeStandard } from '../../functions/possessorBeforeStandard.js';
import type { EsAdjectives } from './es.types.js';
import { PRENOMINAL } from './es.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { apocopate } from './apocopate.js';
import { coordinate } from './coordinate.js';
import { esDeg } from './esDeg.js';
import { esStandard } from './esStandard.js';
import { isPlural } from './isPlural.js';

/**
 * Agree a noun phrase's adjectives with the head's gender/number and split them around it.
 *
 * The compared adjective that carries a standard (P09-E18) is written with it and moves **last**
 * among the postnominal ones, which are coordinated, so the standard attaches to it alone: "un gato
 * negro y más grande que el perro", never "*más grande que el perro y negro".
 */
export function esAdj(np: ResolvedNounPhrase): EsAdjectives {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = isPlural(np.head.forms);
  const pre: string[] = [];
  const post: string[] = [];
  let compared = '';
  for (const a of np.adjectives) {
    const surface = agreeAdj(a.forms['base'] ?? '', gender, plural);
    if (!surface) continue;
    // A comparative/superlative follows the noun even when its plain form precedes it ("el
    // primer gato" but "el gato más primero"), as its degree adverb belongs with the phrase.
    // An intensifier moves it the same way (C33).
    if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive' && !hasIntensifier(a)) {
      pre.push(apocopate(a.conceptId, surface, gender, plural));
    } else {
      const standard = attributiveStandard(np, a);
      if (standard) compared = [esDeg(a, surface), esStandard(a, standard)].filter(Boolean).join(' ');
      else post.push(esDeg(a, surface));
    }
  }
  if (compared) post.push(compared);
  // Beside a genitive possessor they follow it, so the standard is not read as its noun's: "un gato de
  // la mujer más grande que el perro" (A372).
  if (possessorBeforeStandard(np)) return { pre: pre.join(' '), post: '', trail: coordinate(post) };
  return { pre: pre.join(' '), post: coordinate(post) };
}
