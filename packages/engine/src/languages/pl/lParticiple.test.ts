import { describe, expect, test } from 'vitest';
import { lParticiple } from './lParticiple.js';
import { JESC } from './pl.fixtures.js';

describe('lParticiple', () => {
  test('agrees in gender and virility', () => {
    expect(lParticiple(JESC, true, { person: '3', plural: false, gender: 'fem', virile: false })).toBe('zjadła');
    expect(lParticiple(JESC, true, { person: '3', plural: false, gender: 'neut', virile: false })).toBe('zjadło');
    expect(lParticiple(JESC, true, { person: '3', plural: true, gender: 'masc', virile: true })).toBe('zjedli');
    expect(lParticiple(JESC, false, { person: '3', plural: true, gender: 'masc', virile: false })).toBe('jadły');
  });
});
