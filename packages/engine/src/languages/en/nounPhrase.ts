import { isPronominalPossessor } from '@signi/shared';
import type { PronominalPossessor, ResolvedNounPhrase } from '../../types.js';
import { possessiveEn } from '../../possessive.js';
import { determiner } from './determiner.js';
import { isPostModified } from './isPostModified.js';
import { possessivePrefix } from './possessivePrefix.js';
import { possessorPhrase } from './possessorPhrase.js';

export function nounPhrase(forms: Record<string, string>, adj?: string, mods?: string, possessor?: ResolvedNounPhrase | PronominalPossessor, superlative = false): string {
  const count = forms['number'] ?? forms['count'] ?? 'singular';
  const word = count === 'plural' ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  const a = adj ? `${adj} ` : '';
  // Noun-modifiers sit between the adjectives and the head: "the big sail boat".
  const m = mods ? `${mods} ` : '';
  // "a/an" agrees with the first word after the article (adjective, else modifier, else noun).
  const lead = adj || mods || word;
  // A pronominal possessor ("his") is a possessive pronoun that replaces the article ("his book",
  // never "the his book"); English's is invariant of the possessed head.
  if (possessor && isPronominalPossessor(possessor)) {
    return `${possessiveEn(possessor)} ${a}${m}${word}`;
  }
  // A post-modified possessor can't take the Saxon clitic (it would land on the last word of the
  // relative clause), so English uses the of-genitive: "the book of the cat that eats the mouse",
  // the head keeping its own article. Otherwise the possessor replaces the article as a Saxon
  // prefix: "the cat's book", not "the cat's the book".
  if (possessor && isPostModified(possessor)) {
    return `${withDeterminer(determiner(forms, lead, superlative), a)}${m}${word} of ${possessorPhrase(possessor)}`;
  }
  if (possessor) return `${possessivePrefix(possessor)}${a}${m}${word}`;
  return `${withDeterminer(determiner(forms, lead, superlative), a)}${m}${word}`;
}

// English writes "an" and a following "other" as one word: "another cat", not "an other cat".
function withDeterminer(det: string, adj: string): string {
  return det === 'an ' && /^other\b/.test(adj) ? `an${adj}` : `${det}${adj}`;
}
