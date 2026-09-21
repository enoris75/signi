import { isPronominalPossessor } from '@signi/shared';
import type { PronominalPossessor, ResolvedNounPhrase } from '../../types.js';
import { possessiveEn, possessiveEnIndependent } from '../../possessive.js';
import { determiner } from './determiner.js';
import { isPostModified, keepsHeadDeterminer } from './isPostModified.js';
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
  // "all" is the one head determiner a possessor makes room for, by stacking in front of it: "all
  // the cat's books" / "all her books", not "all books of the cat" (A184, A187).
  const allHead = (forms['definiteness'] ?? 'definite') === 'all' && forms['proper'] !== '1';
  // A pronominal possessor ("his") is a possessive pronoun that replaces the article ("his book",
  // never "the his book"); English's is invariant of the possessed head. A head with a determiner
  // of its own keeps it and the possessor goes to the same of-genitive a noun possessor takes,
  // with the *independent* possessive: "this book of hers", "no book of hers" (A187).
  if (possessor && isPronominalPossessor(possessor)) {
    if (allHead) return `all ${possessiveEn(possessor)} ${a}${m}${word}`;
    if (keepsHeadDeterminer(forms)) {
      return `${withDeterminer(determiner(forms, lead, superlative), a)}${m}${word} of ${possessiveEnIndependent(possessor)}`;
    }
    return `${possessiveEn(possessor)} ${a}${m}${word}`;
  }
  if (possessor && !isPostModified(possessor) && allHead) {
    return `all ${possessivePrefix(possessor)}${a}${m}${word}`;
  }
  // English uses the of-genitive in two cases, the head keeping its own article. A post-modified
  // possessor can't take the Saxon clitic (it would land on the last word of the relative clause
  // or of-phrase): "the book of the cat that eats the mouse". And a head with a determiner of its
  // own has nowhere to put it once the clitic fills the determiner slot: "this book of the cat",
  // "no book of the cat" (A184). Otherwise the possessor replaces the article as a Saxon prefix:
  // "the cat's book", not "the cat's the book".
  if (possessor && (isPostModified(possessor) || keepsHeadDeterminer(forms))) {
    return `${withDeterminer(determiner(forms, lead, superlative), a)}${m}${word} of ${possessorPhrase(possessor)}`;
  }
  if (possessor) return `${possessivePrefix(possessor)}${a}${m}${word}`;
  return `${withDeterminer(determiner(forms, lead, superlative), a)}${m}${word}`;
}

// English writes "an" and a following "other" as one word: "another cat", not "an other cat".
function withDeterminer(det: string, adj: string): string {
  return det === 'an ' && /^other\b/.test(adj) ? `an${adj}` : `${det}${adj}`;
}
