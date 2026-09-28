import { describe, expect, test } from 'vitest';
import { futureFinite } from './futureFinite.js';
import { BYC_VERB, JESC, KOCHAC } from './pl.fixtures.js';

describe('futureFinite', () => {
  test('the perfective simple future', () => {
    expect(futureFinite(JESC, true, { person: '3', plural: false, gender: 'masc', virile: false })).toBe('zje');
  });

  test('the imperfective future: będzie + participle', () => {
    expect(futureFinite(JESC, false, { person: '3', plural: false, gender: 'masc', virile: false })).toBe('będzie jadł');
    expect(futureFinite(JESC, false, { person: '1', plural: true, gender: 'fem', virile: false })).toBe('będziemy jadły');
  });

  test('an unpaired verb asked for the perfective takes the imperfective future', () => {
    expect(futureFinite(KOCHAC, true, { person: '3', plural: false, gender: 'fem', virile: false })).toBe('będzie kochała');
  });

  test('BE stores its own', () => {
    expect(futureFinite(BYC_VERB, false, { person: '2', plural: false, gender: 'masc', virile: false })).toBe('będziesz');
  });
});
