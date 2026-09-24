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

  // A348: an unspecified many under `for`, whether `number` kept the plural or only `plural_unmarked` did.
  // A362: under within, during and ago the same plural is an unspecified few instead.
  test('marks a plural indefinite or bare measure as many under for, as few under the other three', () => {
    const many = (phrase: ReturnType<typeof el>) => phrase.conjuncts.map((c) => [c.head.forms['many'], c.head.forms['few'], c.head.forms['numeral']]);
    expect(many(jaMeasuredOnce(el(np(HOUR, { definiteness: 'indefinite', plural_unmarked: '1' })), 'for'))).toEqual([['1', undefined, undefined]]);
    expect(many(jaMeasuredOnce(el(np(HOUR, { definiteness: 'bare', number: 'plural' })), 'for'))).toEqual([['1', undefined, undefined]]);
    expect(many(jaMeasuredOnce(el(np(HOUR, { definiteness: 'definite', plural_unmarked: '1' })), 'for'))).toEqual([[undefined, undefined, undefined]]);
    for (const relation of ['within', 'during', 'ago'] as const) {
      expect(many(jaMeasuredOnce(el(np(HOUR, { definiteness: 'indefinite', plural_unmarked: '1' })), relation))).toEqual([[undefined, '1', undefined]]);
      expect(many(jaMeasuredOnce(el(np(HOUR, { definiteness: 'bare', number: 'plural' })), relation))).toEqual([[undefined, '1', undefined]]);
      expect(many(jaMeasuredOnce(el(np(HOUR, { definiteness: 'definite', plural_unmarked: '1' })), relation))).toEqual([[undefined, undefined, undefined]]);
    }
    expect(many(jaMeasuredOnce(el(np(HOUR, { definiteness: 'indefinite', plural_unmarked: '1' })), 'at'))).toEqual([[undefined, undefined, undefined]]);
    expect(many(jaMeasuredOnce(el(np(JIKAN, { definiteness: 'indefinite', plural_unmarked: '1' })), 'for'))).toEqual([[undefined, undefined, undefined]]);
  });
});
