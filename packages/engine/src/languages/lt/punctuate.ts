/**
 * Tidy the commas the Lithuanian clause writes around every relative, subordinate and object clause (a
 * relative is set off on both sides: *katė, kuri valgo, bėga*): pull a comma back onto the word before
 * it, collapse a run where two clauses abut, drop one before the full stop and one after nothing, and
 * close up double spaces.
 */
export function punctuate(sentence: string): string {
  return sentence
    .replace(/\s+,/g, ',')
    .replace(/,(\s*,)+/g, ',')
    .replace(/^,\s*/, '')
    .replace(/,\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
