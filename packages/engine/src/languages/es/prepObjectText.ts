import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { keptBesidePossessive } from '../../possessive.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS } from './es.consts.js';
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
  if (pf['person']) return withRelative(`${prep} ${pf['disjunctive'] ?? pf['base'] ?? ''}`, np);
  // A determiner that keeps its slot beside a possessive, and "todos", which stands in front of it,
  // are the noun phrase's own to write: "a un amigo mío", "a este amigo mío", "a ningún amigo mío",
  // "a todos mis amigos" (A325), as `possessorText` does after "de". None of them fuses with the
  // preposition, so it simply leads the phrase.
  const possessive = esPossessiveWord(np);
  if (possessive && (['all', 'most'].includes(pf['definiteness'] ?? 'definite') || keptBesidePossessive(pf))) {
    return `${prep} ${npText(np)}`;
  }
  const f = possessedHeadForms(np, 'bare');
  const plural = isPlural(f);
  const adj = esAdj(np);
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  // A cardinal stands after the determiner and possessive, before the noun, as `nounPhrase` places it —
  // and at one beside a definite or demonstrative it is left out (A319): "a los dos amigos", "a
  // estos dos amigos", "a dos amigos" (A340).
  const numeral = oneBesideDeterminer(pf) ? '' : numeralText(f, CARDINALS);
  const noun = [possessive, numeral, withAdj(word, adj)].filter(Boolean).join(' ');
  // The article is chosen from the adjective-aware forms: a prenominal adjective changes the one a
  // stressed-a noun takes ("en la primera agua").
  const af = artForms(f, adj);
  const head = prep === 'a' ? aDet(af, plural) : prep === 'de' ? deDet(af, plural) : prepDet(prep, af, plural);
  return withRelative(`${head} ${noun}`, np);
}
