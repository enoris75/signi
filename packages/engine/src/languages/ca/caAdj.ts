import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { hasIntensifier } from '../../functions/hasIntensifier.js';
import { possessorBeforeStandard } from '../../functions/possessorBeforeStandard.js';
import type { CaAdjectives } from './ca.types.js';
import { PRENOMINAL } from './ca.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { coordinate } from './coordinate.js';
import { caDeg } from './caDeg.js';
import { caStandard } from './caStandard.js';
import { isPlural } from './isPlural.js';

/**
 * Agree a noun phrase's adjectives with the head's gender/number from their stored forms (P03 D6) and
 * split them around it: the few `PRENOMINAL` ones before ("l'altre gat", "el primer dia"), every other
 * after ("un gat negre").
 *
 * The compared adjective that carries a standard (P09-E18) is written with it and moves **last** among
 * the postnominal ones, which are coordinated, so the standard attaches to it alone: "un gat negre i
 * més gran que el gos".
 */
export function caAdj(np: ResolvedNounPhrase): CaAdjectives {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = isPlural(np.head.forms);
  const pre: string[] = [];
  const post: string[] = [];
  let compared = '';
  for (const a of np.adjectives) {
    const surface = agreeAdj(a.forms, gender, plural);
    if (!surface) continue;
    // A compared or intensified adjective follows the noun even when its plain form precedes it.
    if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive' && !hasIntensifier(a)) {
      pre.push(surface);
    } else {
      const standard = attributiveStandard(np, a);
      if (standard) compared = [caDeg(a, surface, plural), caStandard(a, standard)].filter(Boolean).join(' ');
      else post.push(caDeg(a, surface, plural));
    }
  }
  if (compared) post.push(compared);
  // Beside a genitive possessor they follow it, so the standard is not read as its noun's (A372).
  if (possessorBeforeStandard(np)) return { pre: pre.join(' '), post: '', trail: coordinate(post) };
  return { pre: pre.join(' '), post: coordinate(post) };
}
