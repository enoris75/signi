import type { ConceptForms, RubySegment } from '../../types.js';
import { isPlaceAdverb } from '../../functions/isPlaceAdverb.js';
import { wordSeg } from './wordSeg.js';

/**
 * The verb's adverb as a word, or nothing when there is none.
 *
 * An adverb of place carries its locative particle in its word — ここで, そこで, どこでも — and that is
 * the で of the place an act goes on in (ここで食べます). Where the verb marks its place with に instead,
 * as the existential いる / ある and 住む do (`locativeParticle`, see `complementSegs`), the adverb
 * takes the に form its lexeme seeds as `locative_ni`: 猫はここにいます, ここに住みます, どこにでもいます
 * (localization B67). An adverb with no such form keeps its own. A に form with kanji takes its own
 * reading, `locative_ni_reading`: 遠くに, read とおくに (localization B89); a kana one takes none.
 */
export function jaModifierSeg(modifier: ConceptForms | undefined, locativeParticle?: string): RubySegment | undefined {
  if (!modifier) return undefined;
  const ni = locativeParticle === 'に' && isPlaceAdverb(modifier) ? modifier.forms['locative_ni'] : undefined;
  if (ni) return wordSeg(ni, modifier.forms['locative_ni_reading']);
  const base = modifier.forms['base'] ?? '';
  return base ? wordSeg(base, modifier.forms['reading']) : undefined;
}
