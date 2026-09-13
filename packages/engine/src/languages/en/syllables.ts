/** Vowel groups, minus a silent final "e" — enough to tell short adjectives from long ones. */
export function syllables(word: string): number {
  const groups = word.replace(/e$/, '').match(/[aeiouy]+/g);
  return groups ? groups.length : 1;
}
