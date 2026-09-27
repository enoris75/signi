import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { fusedAdverbs } from './fusedAdverbs.js';

const adv = (conceptId: string, forms: Record<string, string>): ConceptForms => ({ conceptId, forms });
const MAI = adv('NEVER', { base: 'mai', subtype: 'frequency', polarity: 'negative', interrogative: 'mai', fuses_with: 'AGAIN', fused: 'mai più' });
const KESSHITE = adv('NEVER', { base: '決して', reading: 'けっして', subtype: 'frequency', polarity: 'negative', interrogative: 'いつか', fuses_with: 'AGAIN', fused: '二度と', fused_reading: 'にどと' });
const NEVER_EN = adv('NEVER', { base: 'never', subtype: 'frequency', polarity: 'negative', interrogative: 'ever' });
const AGAIN = adv('AGAIN', { base: 'di nuovo' });
const FAST = adv('FAST', { base: 'velocemente' });

describe('fusedAdverbs', () => {
  test('the primary and its partner become the fused word, in the primary\'s class and polarity', () => {
    expect(fusedAdverbs(MAI, [AGAIN])).toEqual({
      modifier: adv('NEVER', { base: 'mai più', subtype: 'frequency', polarity: 'negative' }),
    });
  });

  test('a fused word with kanji takes its own reading, and the other extras stay', () => {
    expect(fusedAdverbs(KESSHITE, [FAST, AGAIN])).toEqual({
      modifier: adv('NEVER', { base: '二度と', reading: 'にどと', subtype: 'frequency', polarity: 'negative' }),
      moreAdverbs: [FAST],
    });
  });

  test('no partner, or a lexeme naming none, leaves the adverbs as they are', () => {
    expect(fusedAdverbs(MAI, [FAST])).toEqual({ modifier: MAI, moreAdverbs: [FAST] });
    expect(fusedAdverbs(MAI, undefined)).toEqual({ modifier: MAI, moreAdverbs: undefined });
    expect(fusedAdverbs(NEVER_EN, [AGAIN])).toEqual({ modifier: NEVER_EN, moreAdverbs: [AGAIN] });
    expect(fusedAdverbs(undefined, [AGAIN])).toEqual({ modifier: undefined, moreAdverbs: [AGAIN] });
  });
});
