/**
 * Tidy the commas a parenthetical carries at both ends: the *including* of P09-E33 closes on a comma
 * ("the animals, including the cat, run") that has nothing to close when the phrase ends the sentence,
 * or that meets another comma. A run of commas collapses to one, and a trailing comma gives way to the
 * full stop the translator appends. German and French already tidy their own (`punctuate`); this is
 * the same rule for every language, applied once to the finished sentence.
 */
export function tidyCommas(sentence: string): string {
  return sentence
    .replace(/,(\s*,)+/g, ',')
    .replace(/,\s*$/, '');
}
