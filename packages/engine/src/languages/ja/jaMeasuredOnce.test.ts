import { describe, expect, test } from 'vitest';
import { el, JIKAN, np } from './ja.fixtures.js';
import { jaMeasuredOnce } from './jaMeasuredOnce.js';

const HOUR = { base: '時間', reading: 'じかん', counter: '時間', counter_join: 'head' };
const numeral = (phrase: ReturnType<typeof el>) => phrase.conjuncts.map((c) => c.head.forms['numeral']);

describe('jaMeasuredOnce', () => {
  test('counts an indefinite measure noun as one under the four measuring relations', () => {
    for (const relation of ['within', 'for', 'during', 'ago'] as const) {
      expect(numeral(jaMeasuredOnce(el(np(HOUR, { definiteness: 'indefinite' })), relation))).toEqual(['1']);
    }
  });

  test('leaves a point in time, a definite, a stated numeral and a noun with no counter alone', () => {
    expect(numeral(jaMeasuredOnce(el(np(HOUR, { definiteness: 'indefinite' })), 'at'))).toEqual([undefined]);
    expect(numeral(jaMeasuredOnce(el(np(HOUR, { definiteness: 'definite' })), 'within'))).toEqual([undefined]);
    expect(numeral(jaMeasuredOnce(el(np(HOUR, { definiteness: 'indefinite', numeral: '2' })), 'for'))).toEqual(['2']);
    expect(numeral(jaMeasuredOnce(el(np(JIKAN, { definiteness: 'indefinite' })), 'for'))).toEqual([undefined]);
  });
});
