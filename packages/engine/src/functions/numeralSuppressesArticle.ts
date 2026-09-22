import type { ResolvedNounPhrase } from '../types.js';

/**
 * Whether a counted phrase's **indefinite** article gives way to its numeral (see NounPhrase.numeral,
 * C31). It does, in every language: at one the numeral *is* that article in five of the seven ("un
 * chat" is both "a cat" and "one cat"), and above one no language writes both ("*des deux chats").
 * A definite or demonstrative determiner keeps its place in front of the numeral instead — "the two
 * cats", "le due case", "diese zwei Häuser".
 */
export function numeralSuppressesArticle(np: ResolvedNounPhrase): boolean {
  return np.numeral !== undefined && (np.head.forms['definiteness'] ?? 'definite') === 'indefinite';
}
