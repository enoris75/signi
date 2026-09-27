import { describe, expect, test } from 'vitest';
import { concept } from '../languages/resolved.fixtures.js';
import { adverbClass, allAdverbs, moreAdverbText, moreAdverbsOf } from './adverbClass.js';

describe('adverbClass', () => {
  test('frequency, and a sentence adverb left in its clause', () => {
    expect(adverbClass(concept({ base: 'always', subtype: 'frequency' }))).toBe('frequency');
    expect(adverbClass(concept({ base: 'maybe', subtype: 'sentence' }))).toBe('frequency');
  });

  test('direction and place', () => {
    expect(adverbClass(concept({ base: 'up', subtype: 'direction' }))).toBe('direction');
    expect(adverbClass(concept({ base: 'here', subtype: 'place' }))).toBe('place');
  });

  test('an adverb with no subtype is a manner adverb', () => {
    expect(adverbClass(concept({ base: 'fast' }))).toBe('manner');
  });
});

describe('moreAdverbsOf', () => {
  const fast = concept({ base: 'fast' });
  const well = concept({ base: 'well' });
  const here = concept({ base: 'here', subtype: 'place' });

  test('the extra adverbs of one class, in plan order', () => {
    expect(moreAdverbsOf({ moreAdverbs: [fast, here, well] }, 'manner')).toEqual([fast, well]);
    expect(moreAdverbsOf({ moreAdverbs: [fast, here, well] }, 'place')).toEqual([here]);
  });

  test('none without extras', () => {
    expect(moreAdverbsOf({}, 'manner')).toEqual([]);
    expect(moreAdverbsOf(undefined, 'place')).toEqual([]);
  });
});

describe('moreAdverbText', () => {
  const vp = { moreAdverbs: [concept({ base: 'fast' }), concept({ base: 'well' }), concept({ base: 'here', subtype: 'place' })] };

  test('joined with a space by default', () => {
    expect(moreAdverbText(vp, 'manner')).toBe('fast well');
    expect(moreAdverbText(vp, 'direction')).toBe('');
  });

  test('with the caller\'s own spelling and separator', () => {
    expect(moreAdverbText(vp, 'manner', (a) => a.forms['base']!.toUpperCase(), '')).toBe('FASTWELL');
  });
});

describe('allAdverbs', () => {
  const base = (as: { forms: Record<string, string> }[]) => as.map((a) => a.forms['base']);
  const often = concept({ base: 'often', subtype: 'frequency' });
  const fast = concept({ base: 'fast' });
  const up = concept({ base: 'up', subtype: 'direction' });
  const here = concept({ base: 'here', subtype: 'place' });
  const already = concept({ base: 'already', subtype: 'frequency' });

  // A387: an instrument's act says every adverb, the primary first, then the extras class by class.
  test('the primary, then frequency, place, direction and manner extras', () => {
    expect(base(allAdverbs({ modifier: often, moreAdverbs: [fast, up, here, already] }))).toEqual(['often', 'already', 'here', 'up', 'fast']);
    expect(base(allAdverbs({ modifier: fast }))).toEqual(['fast']);
    expect(allAdverbs({})).toEqual([]);
  });
});
