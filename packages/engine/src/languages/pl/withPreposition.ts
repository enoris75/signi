/** A consonant, for the euphonic vowel's clusters: anything but a vowel letter. */
const C = '[^aąeęioóuy\\s]';

/**
 * A preposition before its phrase, with the euphonic *-e* Polish writes where the next word opens on a
 * cluster the bare preposition would merge into (P05 §2.3; style-pl.md: the engine's, never stored):
 *
 * - *w → we* before *w/f* + consonant (*we wtorek*, *we Wrocławiu*, *we wszystkich*);
 * - *z → ze* before a sibilant + consonant (*ze szkoły*, *ze złota*, *ze środka*) or *w/f* + consonant
 *   (*ze wszystkimi*), and in *ze sobą*;
 * - every consonant-final preposition before *mn-* (*we mnie*, *ze mną*, *ode mnie*, *przede mną*,
 *   *nade mną*, *pode mną*, *beze mnie*, *przeze mnie*).
 *
 * A preposition of more than one word (*z powodu*) ends on a vowel and never takes it.
 */
export function withPreposition(prep: string, text: string): string {
  if (!prep) return text;
  if (!text) return prep;
  const next = text.toLowerCase();
  if (/^mn/.test(next) && /^(w|z|od|przed|nad|pod|bez|przez)$/.test(prep)) return `${prep}e ${text}`;
  if (prep === 'w' && new RegExp(`^[wf]${C}`).test(next)) return `we ${text}`;
  if (prep === 'z' && (new RegExp(`^([sśzźż]|[wf])${C}`).test(next) || /^sob/.test(next))) return `ze ${text}`;
  return `${prep} ${text}`;
}
