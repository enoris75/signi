/**
 * Tidy the punctuation a clause part carried in with it. A dislocated object group closes on a comma
 * ("le chien qui nous voit, lui et moi, court"); when it lands next to another comma (a condition or
 * a coordinated clause follows) the two collapse to one, and a comma at the very end merges with the
 * sentence-final stop the translator appends. Applied once to the finished sentence.
 */
export function punctuate(sentence: string): string {
  return sentence
    .replace(/,(\s*,)+/g, ',') // collapse a run of commas (a group abutting a clause join) into one
    .replace(/,\s*$/, ''); // drop a trailing comma; the full stop closes the clause here
}
