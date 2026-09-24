import type { ResolvedNounPhrase } from '../../types.js';
import { ownHeadForms, possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { keptBesidePossessive } from '../../possessive.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS, PT_DE_FUSING_PRONOUN } from './pt.consts.js';
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
    return withRelative((prep === 'em' || prep === 'de') && PT_DE_FUSING_PRONOUN.test(tonic) ? `${prep === 'em' ? 'n' : 'd'}${tonic}` : `${prep} ${tonic}`, np);
  }
  // A possessive rides on the definite article, which the preposition fuses with ("na minha casa").
  // Unless the head carries a determiner of its own: that keeps its slot and takes the fusion, and the
  // possessive follows the noun — "desta condição minha", "de uma condição minha", "de nenhuma
  // condição minha" (A341, as `complementsPhrase` builds it since A202, and Spanish since A325).
  // "todas" and the partitive "most" keep theirs too, in front of the possessive: "de todas as minhas
  // condições", "da maioria das minhas condições".
  const possessive = ptPossessiveWord(np, false);
  const ownDeterminer = pf['definiteness'] ?? 'definite';
  const detached = !!possessive && keptBesidePossessive(pf);
  const f = !!possessive && (detached || ownDeterminer === 'all' || ownDeterminer === 'most')
    ? ownHeadForms(np)
    : possessedHeadForms(np, 'definite');
  const plural = isPlural(f);
  const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
  // A cardinal stands after the determiner and possessive, before the noun and its adjective, as
  // `complementsPhrase` places it — and at one beside a definite or demonstrative it is left out
  // (A319): "das duas condições", "destas duas condições", "de duas condições", "em um botão" (A356).
  const numeral = oneBesideDeterminer(pf) ? '' : numeralText(f, CARDINALS);
  const noun = (detached
    ? [numeral, withAdj(word, ptAdj(np)), possessive]
    : [possessive, numeral, withAdj(word, ptAdj(np))]).filter(Boolean).join(' ');
  const contract = CONTRACTING[prep];
  const head = contract ? contractDet(contract, prep, f, plural) : prepDet(prep, f, plural);
  return withRelative(`${head} ${noun}`, np);
}
