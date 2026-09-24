import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { ResolvedNounPhrase } from '../../types.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { possessiveIt } from '../../possessive.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { CARDINALS } from './it.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { defArticle } from './defArticle.js';
import { indefArticle } from './indefArticle.js';
import { isPlural } from './isPlural.js';
import { itDeg } from './itDeg.js';
import { itStandard } from './itStandard.js';
import { itMods } from './itMods.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { joinArt } from './joinArt.js';
import { joinWords } from './joinWords.js';
import { prenominalChain } from './prenominalChain.js';
import { prepDet } from './prepDet.js';
import { relativeText } from './relativeText.js';
import { itExamples } from './itExamples.js';
import { splitAdjectives } from './splitAdjectives.js';
import { surface } from './surface.js';

/**
 * Render a noun phrase: [head] [prenominal adjectives] noun [postnominal adjectives].
 * `headFor` builds the article/preposition, receiving the plurality and the surface of
 * the word that will follow it (`lead`) so it can pick the right form/elision. A caller builds it from
 * `itPossessedHeadForms(np)`, so a pronominal possessor's definite article (or none, before a kinship
 * noun) comes out of it.
 */
const COMPARED_DEGREES: ReadonlySet<string> = new Set(['more', 'less', 'equally']);

export function renderNP(np: ResolvedNounPhrase, headFor: (plural: boolean, lead: string) => string): string {
  const forms = np.head.forms;
  const gender = forms['gender'] ?? 'masc';
  const plural = isPlural(forms);
  const noun = surface(forms, plural);
  const { pre, post } = splitAdjectives(np);
  const preSurfaces = prenominalChain(pre, gender, plural, noun);
  // A pronominal possessor ("il **suo** cane") is a prenominal possessive adjective agreeing with
  // *this* possessed head in gender/number, carried by the definite article ("il/la/i/le"). It
  // leads the prenominal chain and forces the definite article, whatever determiner was picked.
  const poss = np.possessor;
  const pronominalPoss = poss ? isPronominalPossessor(poss) : false;
  const possWord = poss && isPronominalPossessor(poss)
    ? possessiveIt(poss, { gender: gender as 'masc' | 'fem', number: plural ? 'plural' : 'singular' })
    : '';
  // A cardinal stands between the determiner and the prenominal adjectives: "le due grandi case" (C31).
  // A numeral standing in for the indefinite article is the article's word, so it leads and the
  // possessive stacks after it, as after "un": "due miei amici", "un mio amico" (A329).
  const numeralLeads = forms['numeral'] !== undefined && forms['indefinite_dropped'] === '1';
  // At one it is the indefinite article's own word, so it takes that article's form before the word
  // that follows it: "un'ora", "un'amica", "uno studente", never "*una ora" (A320).
  // Beside a definite or demonstrative determiner that article would say "*l'un cane", so the one is
  // left out and the phrase is the singular it counts: "il cane", "questo cane" (A319).
  const afterOne = (numeralLeads && pronominalPoss ? possWord : preSurfaces[0]) ?? noun;
  const numeral = oneBesideDeterminer(forms) ? ''
    : forms['numeral'] === '1'
    ? `${forms['approximator'] ?? ''}${indefArticle(forms, false, afterOne)}`
    : numeralText(forms, CARDINALS);
  const preChain = numeralLeads
    ? [...(numeral ? [numeral] : []), ...(pronominalPoss ? [possWord] : []), ...preSurfaces]
    : [...(pronominalPoss ? [possWord] : []), ...(numeral ? [numeral] : []), ...preSurfaces];
  const lead = preChain[0] ?? noun;
  // The caller builds the head from `itPossessedHeadForms`, so a possessive gets the definite article,
  // or the preposition fused with it ("il tuo cane", "al tuo cane", "nella mia casa").
  const head = headFor(plural, lead);
  const core = joinArt(head, joinWords([...preChain, noun]));
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, the
  // conjunction only before the last ("forte, felice e freddo"), the way a coordinated noun slot
  // is joined — not the conjunction repeated between every pair.
  // The compared adjective, last among them (see `splitAdjectives`), is followed by its standard of
  // comparison, ahead of the attributive nouns: "un gatto più grande del cane" (P09-E18). A genitive
  // possessor goes after all of them, or ahead of the adjectives when one is compared (A271, below).
  const postStr = joinConjuncts(
    post.map((a) => joinWords([itDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural)), itStandard(a, attributiveStandard(np, a))])),
    ', ',
    (next) => (/^e/i.test(next) ? ' ed ' : ' e '),
  );
  // A genitive possessor is postnominal, headed by "di" + its own determiner, fused only with the
  // definite article ("il libro del gatto", "di un uomo", "di alcuni uomini"). Rendering it through
  // renderNP recurses for its own adjectives / nested possessor. (A pronominal possessor was
  // already rendered prenominally above, so it is excluded here.)
  // A possessor question's stand-in is *di chi* in the same slot: "il gatto di chi" (P09-E14).
  const possText = isQuestionPossessor(poss) ? 'di chi'
    : poss && !isPronominalPossessor(poss)
    ? renderNP(poss, (plural, lead) => prepDet('di', itPossessedHeadForms(poss), plural, lead))
    : '';
  // A271. Behind a compared adjective the possessor's *di* is where the standard goes, and reads as
  // one ("un gatto più piccolo della donna", *smaller than the woman*). So under a `more`, `less` or
  // `equally` degree the possessor goes ahead of the post-nominal adjectives: "un gatto della donna
  // più piccolo". A superlative keeps its place: its *di* is the partitive it takes anyway (C01).
  const possFirst = !!possText && post.some((a) => COMPARED_DEGREES.has(adjDegree(a)));
  const postAdj = [core, possFirst ? possText : '', postStr].filter(Boolean).join(' ');
  // Attributive nouns are postnominal and bare (no article), the relation choosing the
  // preposition: feature "a" (barca a vela), purpose "da" (occhiali da sole), material
  // "di" (bicchiere di vino). This is deliberately distinct from the possessor's "del".
  const mods = itMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
  const base = possFirst || !possText ? withPost : `${withPost} ${possText}`;
  const rel = relativeText(np);
  // The members of the head's set it names follow everything, the relative clause included (P09-E33).
  return `${rel ? `${base} ${rel}` : base}${itExamples(np)}`;
}
