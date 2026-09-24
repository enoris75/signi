import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { keptBesidePossessive } from '../../possessive.js';
import { npText } from './npText.js';
import { aDet } from './aDet.js';
import { artForms } from './artForms.js';
import { deDet } from './deDet.js';
import { esAdj } from './esAdj.js';
import { esPossessiveWord } from './esPossessiveWord.js';
import { isPlural } from './isPlural.js';
import { prepDet } from './prepDet.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

/**
 * One conjunct of an object that a preposition leads, as a complement's noun phrase: "a" and "de"
 * fuse with "el" ("ve al niño", "a la mujer"), any other preposition leads the determiner as it is
 * ("clica en el botón", "en una casa", "en su casa", A139). A pronoun takes its tonic form after the
 * preposition ("clica en mí", "en él"); it is no clitic there.
 */
export function prepObjectText(np: ResolvedNounPhrase, prep: string): string {
  const pf = np.head.forms;
  if (pf['person']) return `${prep} ${pf['disjunctive'] ?? pf['base'] ?? ''}`;
  // A determiner that keeps its slot beside a possessive, and "todos", which stands in front of it,
  // are the noun phrase's own to write: "a un amigo mío", "a este amigo mío", "a ningún amigo mío",
  // "a todos mis amigos" (A325), as `possessorText` does after "de". None of them fuses with the
  // preposition, so it simply leads the phrase.
  const possessive = esPossessiveWord(np);
  if (possessive && ((pf['definiteness'] ?? 'definite') === 'all' || keptBesidePossessive(pf))) {
    return `${prep} ${npText(np)}`;
  }
  const f = possessedHeadForms(np, 'bare');
  const plural = isPlural(f);
  const adj = esAdj(np);
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const noun = [possessive, withAdj(word, adj)].filter(Boolean).join(' ');
  // The article is chosen from the adjective-aware forms: a prenominal adjective changes the one a
  // stressed-a noun takes ("en la primera agua").
  const af = artForms(f, adj);
  const head = prep === 'a' ? aDet(af, plural) : prep === 'de' ? deDet(af, plural) : prepDet(prep, af, plural);
  return withRelative(`${head} ${noun}`, np);
}
