import type { ResolvedNounElement } from '../types.js';

/**
 * The two-part word of a correlative pair (`NounGroup.correlative`, P09-E26): the first before the
 * first conjunct, the second in place of the plain conjunction — "**both** the cat **and** the dog",
 * "**sowohl** der Kater **als auch** der Hund". `undefined` where the group takes the plain
 * coordination (no flag, or not the "and" pair `resolveNounElement` keeps it on), so a joiner falls
 * through to its own.
 */
export function correlate(
  el: ResolvedNounElement,
  parts: string[],
  [first, second]: readonly [string, string],
): string | undefined {
  if (!el.correlative || parts.length !== 2 || !parts[0] || !parts[1]) return undefined;
  return `${first} ${parts[0]} ${second} ${parts[1]}`;
}

/**
 * A correlative pair cited alone, for the conjunction chip's label (P09-E46): its two words with an
 * ellipsis where the first conjunct goes — "both … and", "sowohl … als auch".
 */
export function citeCorrelative([first, second]: readonly [string, string]): string {
  return `${first} … ${second}`;
}
