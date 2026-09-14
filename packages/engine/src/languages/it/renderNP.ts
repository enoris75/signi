import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { possessiveIt } from '../../possessive.js';
import { agreeAdj } from './agreeAdj.js';
import { defArticle } from './defArticle.js';
import { isPlural } from './isPlural.js';
import { itDeg } from './itDeg.js';
import { itMods } from './itMods.js';
import { itPossessedHeadForms } from './itPossessedHeadForms.js';
import { joinArt } from './joinArt.js';
import { joinWords } from './joinWords.js';
import { prenominalChain } from './prenominalChain.js';
import { prepDet } from './prepDet.js';
import { relativeText } from './relativeText.js';
import { splitAdjectives } from './splitAdjectives.js';
import { surface } from './surface.js';

/**
 * Render a noun phrase: [head] [prenominal adjectives] noun [postnominal adjectives].
 * `headFor` builds the article/preposition, receiving the plurality and the surface of
 * the word that will follow it (`lead`) so it can pick the right form/elision. A caller builds it from
 * `itPossessedHeadForms(np)`, so a pronominal possessor's definite article (or none, before a kinship
 * noun) comes out of it.
 */
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
  const preChain = pronominalPoss ? [possWord, ...preSurfaces] : preSurfaces;
  const lead = preChain[0] ?? noun;
  // The caller builds the head from `itPossessedHeadForms`, so a possessive gets the definite article,
  // or the preposition fused with it ("il tuo cane", "al tuo cane", "nella mia casa").
  const head = headFor(plural, lead);
  const core = joinArt(head, joinWords([...preChain, noun]));
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, the
  // conjunction only before the last ("forte, felice e freddo"), the way a coordinated noun slot
  // is joined — not the conjunction repeated between every pair.
  const postStr = joinConjuncts(
    post.map((a) => itDeg(a, agreeAdj(a.forms['base'] ?? '', gender, plural))),
    ', ',
    (next) => (/^e/i.test(next) ? ' ed ' : ' e '),
  );
  const postAdj = postStr ? `${core} ${postStr}` : core;
  // Attributive nouns are postnominal and bare (no article), the relation choosing the
  // preposition: feature "a" (barca a vela), purpose "da" (occhiali da sole), material
  // "di" (bicchiere di vino). This is deliberately distinct from the possessor's "del".
  const mods = itMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
  // A genitive possessor is postnominal, headed by "di" + its own determiner, fused only with the
  // definite article ("il libro del gatto", "di un uomo", "di alcuni uomini"). Rendering it through
  // renderNP recurses for its own adjectives / nested possessor. (A pronominal possessor was
  // already rendered prenominally above, so it is excluded here.)
  const base = poss && !isPronominalPossessor(poss)
    ? `${withPost} ${renderNP(poss, (plural, lead) => prepDet('di', itPossessedHeadForms(poss), plural, lead))}`
    : withPost;
  const rel = relativeText(np);
  return rel ? `${base} ${rel}` : base;
}
