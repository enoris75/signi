import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { verbAdverbs } from './verbAdverbs.js';

const adv = (conceptId: string, forms: Record<string, string> = {}): ConceptForms => ({ conceptId, forms: { base: conceptId.toLowerCase(), ...forms } });
const OFTEN = adv('OFTEN', { subtype: 'frequency' });
const ALREADY = adv('ALREADY', { subtype: 'frequency' });
const NEVER = adv('NEVER', { subtype: 'frequency', polarity: 'negative' });
const NO_LONGER = adv('NO_LONGER', { subtype: 'frequency', polarity: 'negative' });
const FAST = adv('FAST');
const WELL = adv('WELL');
const UP = adv('UP', { subtype: 'direction' });
const HERE = adv('HERE', { subtype: 'place' });

describe('verbAdverbs', () => {
  test('a lone adverb is the primary, with nothing more', () => {
    expect(verbAdverbs([FAST])).toEqual({ modifier: FAST });
    expect(verbAdverbs([])).toEqual({});
  });

  test('a frequency adverb outranks manner, direction and place, whatever the order', () => {
    expect(verbAdverbs([FAST, HERE, OFTEN])).toEqual({ modifier: OFTEN, moreAdverbs: [FAST, HERE] });
  });

  test('manner outranks direction, and direction place', () => {
    expect(verbAdverbs([HERE, UP, FAST])).toEqual({ modifier: FAST, moreAdverbs: [HERE, UP] });
    expect(verbAdverbs([HERE, UP])).toEqual({ modifier: UP, moreAdverbs: [HERE] });
  });

  test('among equals the first given leads', () => {
    expect(verbAdverbs([ALREADY, OFTEN])).toEqual({ modifier: ALREADY, moreAdverbs: [OFTEN] });
    expect(verbAdverbs([WELL, FAST])).toEqual({ modifier: WELL, moreAdverbs: [FAST] });
  });

  test('a negative adverb leads even a frequency one given before it', () => {
    expect(verbAdverbs([OFTEN, NEVER])).toEqual({ modifier: NEVER, moreAdverbs: [OFTEN] });
  });

  test('only the first negative adverb is kept (D3)', () => {
    expect(verbAdverbs([NEVER, FAST, NO_LONGER])).toEqual({ modifier: NEVER, moreAdverbs: [FAST] });
  });
});
