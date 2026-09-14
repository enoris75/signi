import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import type { PtAdjectives } from './pt.types.js';
import { PRENOMINAL } from './pt.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { isPlural } from './isPlural.js';
import { ptComparison } from './ptComparison.js';

/** Agree a noun phrase's adjectives with the head's gender/number and split them around it. */
export function ptAdj(np: ResolvedNounPhrase): PtAdjectives {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = isPlural(np.head.forms);
  const pre: string[] = [];
  const post: string[] = [];
  for (const a of np.adjectives) {
    // A comparative/superlative follows the noun even when its plain form precedes it: its
    // degree marking (periphrastic "mais …" or a suppletive like "maior") belongs with the
    // phrase, not between the article and the noun.
    if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive') {
      const surface = agreeAdj(a.forms['base'] ?? '', gender, plural);
      if (surface) pre.push(surface);
    } else {
      const surface = ptComparison(a, gender, plural);
      if (surface) post.push(surface);
    }
  }
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, "e"
  // only before the last ("grande, velho e belo"), like a coordinated noun slot.
  return { pre: pre.join(' '), post: joinConjuncts(post, ', ', () => ' e ') };
}
