import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { hasIntensifier } from '../../functions/hasIntensifier.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { possessorBeforeStandard } from '../../functions/possessorBeforeStandard.js';
import type { PtAdjectives } from './pt.types.js';
import { PRENOMINAL, PT_SUPPLETIVE } from './pt.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { coordinateElement } from './coordinateElement.js';
import { isPlural } from './isPlural.js';
import { ptComparison } from './ptComparison.js';
import { prepObjectText } from './prepObjectText.js';
import { ptStandard } from './ptStandard.js';

/**
 * Agree a noun phrase's adjectives with the head's gender/number and split them around it.
 *
 * The compared adjective that carries a standard (P09-E18) is written with it and moves **last**
 * among the postnominal ones, which are coordinated, so the standard attaches to it alone: "um gato
 * preto e maior do que o cão".
 */
export function ptAdj(np: ResolvedNounPhrase): PtAdjectives {
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = isPlural(np.head.forms);
  const pre: string[] = [];
  const post: string[] = [];
  let compared = '';
  let trailingSet = '';
  for (const a of np.adjectives) {
    // A compared adjective follows the noun even when its plain form precedes it: its degree
    // marking belongs with the phrase, not between the article and the noun — "o gato maior" (the
    // bigger cat), "o gato mais belo" (the most beautiful cat).
    // One exception: a suppletive at `most` stands before the noun, "o maior gato", "o melhor gato"
    // (A178). After the noun it reads as the comparative, and the superlative loses the one place
    // Portuguese marks it, since the definite article is on the comparative too (C01).
    // An intensified adjective follows the noun in either case, as a compared one does (C33).
    if (PT_SUPPLETIVE[a.forms['base'] ?? ''] && adjDegree(a) === 'most' && !hasIntensifier(a)) {
      const surface = ptComparison(a, gender, plural);
      if (surface) pre.push(surface);
      // Its set follows the noun, after every post-nominal adjective: "a maior casa da cidade" (A371).
      // Behind a genitive possessor a second "de" would read as the possessor's, "da mulher da cidade",
      // so the set is said as the place it is: "a maior casa da mulher na cidade" (A380).
      const set = attributiveStandard(np, a);
      if (surface && set) trailingSet = possessorBeforeStandard(np) ? coordinateElement(set, (s) => prepObjectText(s, 'em')) : ptStandard(a, set);
    } else if (PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive' && !hasIntensifier(a)) {
      const surface = agreeAdj(a.forms['base'] ?? '', gender, plural);
      if (surface) pre.push(surface);
    } else {
      const surface = ptComparison(a, gender, plural);
      const standard = attributiveStandard(np, a);
      if (surface && standard) compared = [surface, ptStandard(a, standard)].filter(Boolean).join(' ');
      else if (surface) post.push(surface);
    }
  }
  if (compared) post.push(compared);
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, "e"
  // only before the last ("grande, velho e belo"), like a coordinated noun slot.
  const coordinated = joinConjuncts(post, ', ', () => ' e ');
  const adjectives = [coordinated, trailingSet].filter(Boolean).join(' ');
  // The determiner "enough" is the postnominal "suficiente(s)" in Portuguese ("comida suficiente",
  // "gatos suficientes"), after the adjectives and outside their coordination (P09-E25). It is the
  // determiner, not one more adjective, so it closes the phrase: "comida quente suficiente".
  const enough = np.head.forms['definiteness'] === 'enough' ? (plural ? 'suficientes' : 'suficiente') : '';
  // Beside a pronominal possessive, which follows the noun as beside any kept determiner (A187), it
  // goes in front instead, as Spanish has it: "suficientes gatos seus", not the two postnominal words
  // of "gatos suficientes seus" (A313).
  if (enough && np.possessor && isPronominalPossessor(np.possessor)) {
    return { pre: [enough, ...pre].join(' '), post: adjectives };
  }
  // Beside a genitive possessor the adjectives follow it, so the standard is not read as its noun's:
  // "um gato da mulher maior do que o cão" (A372). "suficiente" stays with the noun.
  // A prenominal superlative leaves only its set to follow it, the plain adjectives staying with the
  // noun: "a maior casa velha da mulher da cidade" (A371), never "*… da mulher velha", the woman's.
  if (possessorBeforeStandard(np)) {
    return trailingSet
      ? { pre: pre.join(' '), post: [coordinated, enough].filter(Boolean).join(' '), trail: trailingSet }
      : { pre: pre.join(' '), post: enough, trail: adjectives };
  }
  return { pre: pre.join(' '), post: [adjectives, enough].filter(Boolean).join(' ') };
}
