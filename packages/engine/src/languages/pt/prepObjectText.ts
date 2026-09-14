import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { PT_DE_FUSING_PRONOUN } from './pt.consts.js';
import { contractDet } from './contractDet.js';
import { datPrep } from './datPrep.js';
import { dePrep } from './dePrep.js';
import { emPrep } from './emPrep.js';
import { isPlural } from './isPlural.js';
import { porPrep } from './porPrep.js';
import { prepDet } from './prepDet.js';
import { ptAdj } from './ptAdj.js';
import { ptPossessiveWord } from './ptPossessiveWord.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';

// The prepositions that contract with the article, each with its fusion: em + o → no, de + o → do, a + o →
// ao, por + o → pelo.
const CONTRACTING: Record<string, (f: Record<string, string>, plural: boolean) => string> = { em: emPrep, de: dePrep, a: datPrep, por: porPrep };

/**
 * One conjunct of the object of a verb that takes it with a preposition (A139), as a complement's
 * noun phrase: the preposition contracts with the article or a demonstrative ("clica no botão", "na
 * minha casa", "nesta casa") and leads any other determiner ("em um botão"). A pronoun is no clitic
 * there: it takes its tonic form, which "em" and "de" fuse with in the 3rd person ("clica em mim",
 * "nele").
 */
export function prepObjectText(np: ResolvedNounPhrase, prep: string): string {
  const pf = np.head.forms;
  if (pf['person']) {
    const tonic = pf['disjunctive'] ?? pf['base'] ?? '';
    return (prep === 'em' || prep === 'de') && PT_DE_FUSING_PRONOUN.test(tonic) ? `${prep === 'em' ? 'n' : 'd'}${tonic}` : `${prep} ${tonic}`;
  }
  // A possessive rides on the definite article, which the preposition fuses with ("na minha casa").
  const f = possessedHeadForms(np, 'definite');
  const plural = isPlural(f);
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  const noun = [ptPossessiveWord(np, false), withAdj(word, ptAdj(np))].filter(Boolean).join(' ');
  const contract = CONTRACTING[prep];
  const head = contract ? contractDet(contract, prep, f, plural) : prepDet(prep, f, plural);
  return withRelative(`${head} ${noun}`, np);
}
