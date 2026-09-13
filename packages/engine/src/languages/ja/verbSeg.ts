import type { Tense } from '@signi/shared';
import type { ResolvedVerbPhrase, RubySegment } from '../../types.js';
import { masuEnding } from './masuEnding.js';
import { masuStem } from './masuStem.js';
import { wordSeg } from './wordSeg.js';

/**
 * The verb segment. Japanese has no dedicated future, so future reuses the present (masu)
 * form; the polite past is the masu-stem + ました (negative ませんでした). The reading is
 * derived the same way from the masu-stem's reading so the furigana tracks the surface.
 */
export function verbSeg(verb: ResolvedVerbPhrase['verb'], negative: boolean | undefined, tense: Tense): RubySegment {
  const masuPresent = verb.forms['masu_present'] ?? verb.forms['base'] ?? '';
  const st = masuStem(verb);
  if (!st || (tense !== 'past' && !negative)) {
    return wordSeg(masuPresent, verb.forms['masu_present_reading']); // present / future
  }
  const suffix = masuEnding(tense, negative === true);
  return wordSeg(st.stem + suffix, st.reading !== undefined ? st.reading + suffix : undefined);
}
