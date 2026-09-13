// A stressed final vowel keeps its stress written once the -r / -z is gone ("comer" → "comê-lo").
const STRESS: Record<string, string> = { a: 'á', e: 'ê', o: 'ô' };

/**
 * Attach a 3rd-person object clitic (o / a / os / as) after a Portuguese verb form, hyphenated, in its
 * enclitic allomorph:
 * - after -r or -z the consonant drops, the clitic becomes lo / la / los / las, and a final a / e / o
 *   takes its accent ("comer" → "comê-lo", "carregar" → "carregá-lo", "ver" → "vê-lo");
 * - after -s the consonant drops the same way, with no accent ("comamos" → "comamo-lo");
 * - after a nasal (-m, -ão, -õe) it becomes no / na / nos / nas ("comem-no");
 * - anywhere else it keeps its shape ("veja-o", "vejo-o").
 */
export function ptEnclitic(verb: string, clitic: string): string {
  if (!clitic) return verb;
  const last = verb.slice(-1);
  if (last === 'r' || last === 'z' || last === 's') {
    const stem = verb.slice(0, -1);
    const vowel = stem.slice(-1);
    const stressed = last === 's' ? stem : `${stem.slice(0, -1)}${STRESS[vowel] ?? vowel}`;
    return `${stressed}-l${clitic}`;
  }
  if (/(?:m|ão|õe)$/.test(verb)) return `${verb}-n${clitic}`;
  return `${verb}-${clitic}`;
}
