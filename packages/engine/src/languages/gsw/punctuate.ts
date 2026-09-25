/**
 * Tidy the punctuation a clause part carried in with it: the parts are joined with spaces, which
 * puts one in front of a leading comma ("beginnt , indem"). A relative clause also carries a
 * closing comma; when it lands next to another comma (adjacent clauses) it collapses to one, and
 * a comma at the very end merges with the sentence-final stop the translator appends. Applied once
 * to the finished sentence.
 */
export function punctuate(sentence: string): string {
  return sentence
    .replace(/\s+,/g, ',') // pull a comma back onto the preceding word
    .replace(/,(\s*,)+/g, ',') // collapse a run of commas (two abutting clauses) into one
    .replace(/,\s*$/, ''); // drop a trailing comma; the full stop closes the clause here
}
