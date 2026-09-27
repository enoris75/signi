import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { possessiveSursilv } from '../../possessive.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { possessorBeforeStandard } from '../../functions/possessorBeforeStandard.js';
import { CARDINALS } from './sursilv.consts.js';
import { andLink } from './coordinate.js';
import { agreeAdj } from './agreeAdj.js';
import { indefArticle } from './indefArticle.js';
import { isPlural } from './isPlural.js';
import { sursilvDeg } from './sursilvDeg.js';
import { sursilvStandard } from './sursilvStandard.js';
import { sursilvMods } from './sursilvMods.js';
import { sursilvPossessedHeadForms } from './sursilvPossessedHeadForms.js';
import { joinArt } from './joinArt.js';
import { joinWords } from './joinWords.js';
import { prenominalChain } from './prenominalChain.js';
import { prepDet } from './prepDet.js';
import { relativeText } from './relativeText.js';
import { sursilvExamples } from './sursilvExamples.js';
import { splitAdjectives } from './splitAdjectives.js';
import { surface } from './surface.js';

const COMPARED_DEGREES: ReadonlySet<string> = new Set(['more', 'less', 'equally']);

/**
 * Render a noun phrase: [head] [possessive] [numeral] [prenominal adjectives] noun [postnominal
 * adjectives] [possessor] [attributive nouns] [relative] (P04 §2.1). `headFor` builds the determiner or
 * the preposition + determiner, receiving the plurality and the word that will follow it (`lead`) so
 * it can elide ("l'um", "l'auter gat"). A caller builds it from `sursilvPossessedHeadForms(np)`, so a
 * pronominal possessor leaves no article: "mes gat", "a mes gat".
 */
export function renderNP(np: ResolvedNounPhrase, headFor: (plural: boolean, lead: string) => string): string {
  const forms = np.head.forms;
  const gender = forms['gender'] ?? 'masc';
  const plural = isPlural(forms);
  const noun = surface(forms, plural);
  const { pre, post } = splitAdjectives(np);
  const preSurfaces = prenominalChain(pre, gender, plural);
  // A pronominal possessor ("**mes** gat") is a prenominal possessive agreeing with this head.
  const poss = np.possessor;
  const pronominalPoss = poss ? isPronominalPossessor(poss) : false;
  const possWord = poss && isPronominalPossessor(poss)
    ? possessiveSursilv(poss, { gender: gender as 'masc' | 'fem', number: plural ? 'plural' : 'singular' })
    : '';
  // A cardinal stands between the determiner and the prenominal adjectives (C31); one standing in for
  // the indefinite article leads, and the possessive stacks after it: "dus mes amis" (A329). At one it
  // is the indefinite article's own word, *in / ina* (A320); beside a definite or demonstrative
  // determiner it is left out (A319).
  const numeralLeads = forms['numeral'] !== undefined && forms['indefinite_dropped'] === '1';
  const numeral = oneBesideDeterminer(forms, pronominalPoss) ? ''
    : forms['numeral'] === '1'
    ? `${forms['approximator'] ?? ''}${indefArticle(forms, false)}`
    : numeralText(forms, CARDINALS);
  const preChain = numeralLeads
    ? [...(numeral ? [numeral] : []), ...(pronominalPoss ? [possWord] : []), ...preSurfaces]
    : [...(pronominalPoss ? [possWord] : []), ...(numeral ? [numeral] : []), ...preSurfaces];
  const lead = preChain[0] ?? noun;
  const head = headFor(plural, lead);
  const core = joinArt(head, joinWords([...preChain, noun]));
  // The postnominal adjectives as a list, the conjunction before the last ("ferm, led e fraid"); the
  // compared one last, followed by its standard: "in gat pli grond ch'il tgaun" (P09-E18).
  const postStr = joinConjuncts(
    post.map((a) => joinWords([sursilvDeg(a, agreeAdj(a.forms, gender, plural)), sursilvStandard(a, attributiveStandard(np, a))])),
    ', ',
    andLink,
  );
  // A genitive possessor follows under *da*, contracting with a masculine definite article ("il
  // cudisch dil gat", "da la dunna", "d'in um" is not written: "da in um"). A possessor question's
  // stand-in is *da tgi* (P09-E14).
  const possText = isQuestionPossessor(poss) ? 'da tgi'
    : poss && !isPronominalPossessor(poss)
    ? renderNP(poss, (plural, lead) => prepDet('da', sursilvPossessedHeadForms(poss), plural, lead))
    : '';
  // A271: behind a compared adjective the possessor's *da* would read as the standard's, so the
  // possessor goes first there.
  const possFirst = !!possText && (post.some((a) => COMPARED_DEGREES.has(adjDegree(a))) || possessorBeforeStandard(np));
  const postAdj = [core, possFirst ? possText : '', postStr].filter(Boolean).join(' ');
  const mods = sursilvMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
  const base = possFirst || !possText ? withPost : `${withPost} ${possText}`;
  const rel = relativeText(np);
  return `${rel ? `${base} ${rel}` : base}${sursilvExamples(np)}`;
}
