import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { jaCounted } from './jaCounted.js';

const np = (forms: Record<string, string>): ResolvedNounPhrase =>
  ({ head: { conceptId: 'X', forms }, adjectives: [], nounModifiers: [] });

describe('jaCounted', () => {
  test('the counter comes from the lexeme, or from the noun\'s animacy', () => {
    expect(jaCounted(np({ numeral: '2', counter: '軒' }))?.segs).toEqual([{ t: '二軒' }, { t: 'の' }]);
    expect(jaCounted(np({ numeral: '2', animate: '1' }))?.segs).toEqual([{ t: '二匹' }, { t: 'の' }]);
    expect(jaCounted(np({ numeral: '2', human: '1', animate: '1' }))?.segs).toEqual([{ t: '二人' }, { t: 'の' }]);
    expect(jaCounted(np({ numeral: '2' }))?.segs).toEqual([{ t: '二つ' }, { t: 'の' }]);
  });

  test('a time word is its own counter, and is not said twice', () => {
    const counted = jaCounted(np({ numeral: '24', counter: '時間', counter_join: 'head' }));
    expect(counted?.segs).toEqual([{ t: '二十四時間' }]);
    expect(counted?.replacesHead).toBe(true);
  });

  test('a relative the count compounds onto takes no の, and the head is still said (P11-E5)', () => {
    const counted = jaCounted(np({ numeral: '3', human: '1', base: '兄弟', counter_join: 'compound' }));
    expect(counted?.segs).toEqual([{ t: '三人' }]);
    expect(counted?.replacesHead).toBe(false);
  });

  test('a head that is no longer the lexeme\'s own word keeps the の', () => {
    // The honorific someone else's siblings take, and a fused adjective's word (兄 for ELDER).
    expect(jaCounted(np({ numeral: '3', human: '1', base: 'ご兄弟', honorific: 'ご兄弟', counter_join: 'compound' }))?.segs)
      .toEqual([{ t: '三人' }, { t: 'の' }]);
    expect(jaCounted(np({ numeral: '3', human: '1', base: '兄', with_ELDER: '兄', counter_join: 'compound' }))?.segs)
      .toEqual([{ t: '三人' }, { t: 'の' }]);
    const withAdjective: ResolvedNounPhrase = {
      head: { conceptId: 'X', forms: { numeral: '3', human: '1', base: '兄弟', counter_join: 'compound' } },
      adjectives: [{ conceptId: 'BIG', forms: { base: '大きい' } }],
      nounModifiers: [],
    };
    expect(jaCounted(withAdjective)?.segs).toEqual([{ t: '三人' }, { t: 'の' }]);
  });

  test('a phrase that counts nothing has none', () => {
    expect(jaCounted(np({}))).toBeUndefined();
  });
});
