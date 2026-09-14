import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { joinConjuncts } from '../../resolved/joinConjuncts.js';
import { possessedHeadForms } from '../../resolved/possessedHeadForms.js';
import { possessiveFr } from '../../possessive.js';
import { deDet } from './deDet.js';
import { elidesBefore } from './elidesBefore.js';
import { frMods } from './frMods.js';
import { joinArt } from './joinArt.js';
import { liaisonAdjectives } from './liaisonAdjectives.js';
import { relativeText } from './relativeText.js';
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
  const poss = np.possessor;
  const possWord = poss && isPronominalPossessor(poss)
    ? possessiveFr(
        poss,
        { gender: (forms['gender'] ?? 'masc') as 'masc' | 'fem', number: plural ? 'plural' : 'singular' },
        elidesBefore(forms, lead),
      )
    : '';
  const words = [possWord, ...pre, noun].filter(Boolean);
  const core = joinArt(headFor(plural, words[0] ?? noun), words.join(' '));
  // Coordinate the postnominal adjectives as a list: commas between all but the last pair, "et"
  // only before the last ("fort, heureux et froid"), like a coordinated noun slot.
  const postStr = joinConjuncts(post, ', ', () => ' et ');
  const postAdj = postStr ? `${core} ${postStr}` : core;
  // Attributive nouns are postnominal and bare, the relation choosing the preposition:
  // feature "à" (bateau à voile), purpose/material "de" (lunettes de soleil). Distinct
  // from the possessor's contracted "du/de la".
  const mods = frMods(np);
  const withPost = mods ? `${postAdj} ${mods}` : postAdj;
  // A genitive possessor is postnominal, headed by "de" + its own determiner, contracted only with
  // the definite article ("le livre du chat", "d'un chat", "de quelques chats"). Rendering it
  // through renderNP recurses for its own adjectives / nested possessor. (A pronominal possessor
  // was already rendered prenominally above.)
  const base = poss && !isPronominalPossessor(poss)
    ? `${withPost} ${renderNP(poss, (plural, lead) => deDet(possessedHeadForms(poss, 'bare'), plural, lead))}`
    : withPost;
  const rel = relativeText(np);
  return rel ? `${base} ${rel}` : base;
}
