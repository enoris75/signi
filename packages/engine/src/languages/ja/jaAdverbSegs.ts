import type { ConceptForms, ResolvedVerbPhrase, RubySegment } from '../../types.js';
import { adverbClass, moreAdverbsOf, type AdverbClass } from '../../functions/adverbClass.js';
import { jaModifierSeg } from './jaModifierSeg.js';

/**
 * The verb's adverbs as words, each with its reading, in the order they stand before the predicate:
 * the frequency ones first, then the place, the direction and the manner ones, the manner nearest the
 * verb — 猫はよくここで速く走ります (P15). A frequency primary leads, with any further frequency adverb
 * beside it (もうよく走ります), and so does a negative one (決して速く走りません); any other primary stands
 * in its class's slot among the rest.
 *
 * `gapRelation`, the word a relative clause says for its gap (see `predicateSegs`), stands behind the
 * leading frequency adverbs and ahead of the rest: いつも一緒に走る, 一緒に速く走る. Each place adverb
 * takes the verb's locative particle (see `jaModifierSeg`).
 */
export function jaAdverbSegs(
  verbPhrase: Pick<ResolvedVerbPhrase, 'modifier' | 'moreAdverbs'>,
  locativeParticle?: string,
  gapRelation: RubySegment[] = [],
): RubySegment[] {
  const { modifier } = verbPhrase;
  const leads = modifier?.forms['subtype'] === 'frequency';
  const slot = (cls: AdverbClass): ConceptForms[] => [
    ...(modifier && !leads && adverbClass(modifier) === cls ? [modifier] : []),
    ...moreAdverbsOf(verbPhrase, cls),
  ];
  const lead = modifier && leads ? [modifier, ...moreAdverbsOf(verbPhrase, 'frequency')] : [];
  const rest = [...(leads ? [] : slot('frequency')), ...slot('place'), ...slot('direction'), ...slot('manner')];
  const words = (adverbs: ConceptForms[]): RubySegment[] =>
    adverbs.flatMap((a) => jaModifierSeg(a, locativeParticle) ?? []);
  return [...words(lead), ...gapRelation, ...words(rest)];
}
