import type { ConceptForms, RubySegment } from '../../types.js';
import { wordSeg } from './wordSeg.js';

/**
 * An adjective's intensifier as a word standing before it — とても大きい (see
 * NounPhrase.adjectiveIntensifiers, C33). Japanese writes VERY that way and TOO not at all: 〜すぎる
 * is a suffix on the adjective's stem, which `jaComparisonAdj` builds into the adjective itself, so
 * a `suffix` intensifier returns nothing here. So does an adjective with none.
 */
export function jaIntensifierSeg(a: ConceptForms): RubySegment | undefined {
  const word = a.forms['intensifier'];
  if (!word || a.forms['intensifier_position'] === 'suffix') return undefined;
  return wordSeg(word, a.forms['intensifier_reading']);
}
