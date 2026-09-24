import { isPronominalPossessor } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import type { PronominalPossessor, ResolvedNounPhrase } from '../../types.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { disjunctiveFr, keptBesidePossessive, possessiveFr } from '../../possessive.js';
import { numeralText } from '../../functions/numeralText.js';
import { CARDINALS } from './fr.consts.js';
import { artFor } from './artFor.js';
import { deDet } from './deDet.js';
import { deicticClitic } from './deicticClitic.js';
import { elidesBefore } from './elidesBefore.js';
import { frMods } from './frMods.js';
import { joinArt } from './joinArt.js';
import { liaisonAdjectives } from './liaisonAdjectives.js';
import { relativeText } from './relativeText.js';
import { frExamples } from './frExamples.js';
import { splitAdjectives } from './splitAdjectives.js';

/**
 * Render a noun phrase: [head] [prenominal adjectives] noun [postnominal adjectives].
 * `headFor` builds the article/preposition, receiving the surface of the word that will
 * follow it (`lead`) so it can pick the right elision ("le" vs "l'").
 */
export function renderNP(np: ResolvedNounPhrase, headFor: (plural: boolean, lead: string) => string): string {
  const forms = np.head.forms;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const split = splitAdjectives(np);
  const { post } = split;
  // A masculine singular beau / nouveau / vieux before a vowel sound takes bel / nouvel / vieil; the
  // article is then chosen against that form ("le vieil homme", "ce nouvel argent").
  const pre = liaisonAdjectives(split.pre, forms, noun, plural);
  const lead = pre[0] ?? noun;
  // A pronominal possessor ("**son** chien") is a prenominal possessive that replaces the article,
  // agreeing with *this* possessed head; mon/ton/son stand in before a vowel-initial feminine. The
  // caller builds the head from `possessedHeadForms(np, 'bare')`, so what is left of it is a
  // complement's preposition alone ("à ton chien", "dans ma maison", "de mon chien").
  //
  // A head that carries a determiner of its own keeps it, and the possessor moves into a
  // postnominal "à" phrase instead: "ce livre à elle", "aucun livre à elle" (A187). `headFor` was
  // built from a head `possessedHeadForms` left bare for the possessive, so the determiner is spelled
  // here, in front of the noun and behind whatever preposition the head still carries ("dans cette
  // maison à moi"). After "all" the possessive stays where it is and the quantifier leads, taking
  // the definite article's place: "tous ses livres".
  const poss = np.possessor;
  const pronominal = !!poss && isPronominalPossessor(poss);
  const definiteness = forms['definiteness'] ?? 'definite';
  const detached = pronominal && keptBesidePossessive(forms);
  const possWord = poss && isPronominalPossessor(poss) && !detached
    ? possessiveFr(
        poss,
        { gender: (forms['gender'] ?? 'masc') as 'masc' | 'fem', number: plural ? 'plural' : 'singular' },
        elidesBefore(forms, lead),
      )
    : '';
  const fem = (forms['gender'] ?? 'masc') === 'fem';
  // A possessed name takes the determiner the user picked, `proper` dropped as `possessedHeadForms`
  // drops it.
  const { proper: _name, ...ownForms } = forms;
  const detWord = detached ? artFor(ownForms, plural, lead)
    : pronominal && definiteness === 'all' ? (fem ? 'toutes' : 'tous')
    : '';
  // A cardinal stands between the determiner and the prenominal adjectives: "les deux grandes
  // maisons" (C31). A count noun whose cardinal form differs takes it here — "deux ans", where the
  // bare noun is "année" (`cardinal_form`).
  const numeral = numeralText(forms, CARDINALS);
  const cardinalForm = plural ? forms['cardinal_form_plural'] : forms['cardinal_form'];
  const counted = numeral && cardinalForm ? cardinalForm : noun;
  const words = [detWord, possWord, ...(numeral ? [numeral] : []), ...pre, counted].filter(Boolean);
  // A kept partitive elides into its noun like any article: "de l'eau à moi" (A277).
  const [first = '', ...rest] = words;
  const core = joinArt(headFor(plural, first || noun), rest.length ? joinArt(first, rest.join(' ')) : first);
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, "et"
  // only before the last ("fort, heureux et froid"), like a coordinated noun slot.
  const postStr = joinConjuncts(post, ', ', () => ' et ');
  // A contrastive demonstrative carries its distance in the postposed clitic, not in "ce", which
  // says both (C40): "ce lieu-là", "cette robe bleue-là". It closes the noun's own material, so it
  // stands behind the postnominal adjectives and ahead of a modifier, possessor or relative.
  const deictic = deicticClitic(definiteness, np.contrastive === true);
  const postAdj = `${postStr ? `${core} ${postStr}` : core}${deictic}`;
  // Attributive nouns are postnominal and bare, the relation choosing the preposition:
  // feature "à" (bateau à voile), purpose/material "de" (lunettes de soleil). Distinct
  // from the possessor's contracted "du/de la".
  const mods = frMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
  // A genitive possessor is postnominal, headed by "de" + its own determiner, contracted only with
  // the definite article ("le livre du chat", "d'un chat", "de quelques chats"). Rendering it
  // through renderNP recurses for its own adjectives / nested possessor. (A pronominal possessor
  // was already rendered prenominally above.)
  // A possessor question's stand-in is *de qui* in the same slot — never the relative *dont*: "le chat
  // de qui" (P09-E14).
  const base = isQuestionPossessor(poss) ? `${withPost} de qui`
    : poss && !isPronominalPossessor(poss)
    ? `${withPost} ${renderNP(poss, (plural, lead) => deDet(possessedHeadForms(poss, 'bare'), plural, lead))}`
    // The detached possessor takes the genitive's own postnominal slot: "ce livre à elle".
    : detached && poss ? `${withPost} à ${disjunctiveFr(poss as PronominalPossessor)}`
    : withPost;
  const rel = relativeText(np);
  // The members of the head's set it names follow everything, the relative clause included (P09-E33).
  return `${rel ? `${base} ${rel}` : base}${frExamples(np)}`;
}
