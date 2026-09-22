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
    const counted = jaCounted(np({ numeral: '24', counter: '時間', counter_is_head: '1' }));
    expect(counted?.segs).toEqual([{ t: '二十四時間' }]);
    expect(counted?.replacesHead).toBe(true);
  });

  test('a phrase that counts nothing has none', () => {
    expect(jaCounted(np({}))).toBeUndefined();
  });
});
