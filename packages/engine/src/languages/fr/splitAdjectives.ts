import type { ResolvedNounPhrase } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { hasIntensifier } from '../../functions/hasIntensifier.js';
import { isRelativeSuperlative } from '../../functions/isRelativeSuperlative.js';
import { superlativeLead } from '../../functions/superlativeLead.js';
import { PRENOMINAL } from './fr.consts.js';
import { frComparison } from './frComparison.js';

/** Split a phrase's adjectives (surface = base form) into pre- and post-nominal groups. */
export function splitAdjectives(np: ResolvedNounPhrase): { pre: string[]; post: string[] } {
  const pre: string[] = [];
  const post: string[] = [];
  const gender = np.head.forms['gender'] ?? 'masc';
  const plural = (np.head.forms['number'] ?? np.head.forms['count']) === 'plural';
  for (const a of np.adjectives) {
    // A superlative's intensifier stands before the doubled article: "le chat de loin le plus grand" (A257).
    const { lead, adjective } = superlativeLead(a);
    let word = frComparison(adjective, gender, plural);
    if (!word) continue;
    // A postnominal relative superlative repeats the definite article, agreed with the noun:
    // "le chat LE plus grand", "la souris LA plus grande", "les chats LES plus grands" — the
    // doubled article is what distinguishes the superlative from the homophonous comparative
    // ("le chat plus grand"). Suppletives double too ("le chat le meilleur"). "plus"/"moins" are
    // consonant-initial, so the article never elides. (Italian/Spanish/Portuguese do NOT double —
    // there the single article is deliberate; see C01.)
    if (isRelativeSuperlative(a)) {
      word = [lead, `${plural ? 'les' : gender === 'fem' ? 'la' : 'le'} ${word}`].filter(Boolean).join(' ');
    }
    // A comparative/superlative adjective is postnominal in French ("le chat plus grand",
    // "le chat meilleur"), even when its plain form would precede the noun — this also avoids
    // elision artefacts ("l'aussi grand chat"). An intensifier moves it the same way (C33).
    const prenominal = PRENOMINAL.has(a.conceptId) && adjDegree(a) === 'positive' && !hasIntensifier(a);
    (prenominal ? pre : post).push(word);
  }
  return { pre, post };
}
