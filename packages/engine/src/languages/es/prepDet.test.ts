import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, ANTARTIDA, CASA, CUIDADO, GATO } from './es.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('the preposition takes whatever determiner the phrase chose', () => {
    expect(prepDet('en', CASA)).toBe('en la');
    expect(prepDet('en', { ...CASA, definiteness: 'indefinite' })).toBe('en una');
    expect(prepDet('hacia', { ...GATO, definiteness: 'this' })).toBe('hacia este');
    expect(prepDet('por', GATO, true)).toBe('por los');
  });

  test('only a and de fuse with el, so these never contract', () => {
    expect(prepDet('con', GATO)).toBe('con el');
    expect(prepDet('en', AGUA)).toBe('en el');
  });

  test('a bare phrase leaves the preposition alone', () => {
    expect(prepDet('en', { ...CASA, definiteness: 'bare' })).toBe('en');
    expect(prepDet('con', { ...CUIDADO, definiteness: 'bare' })).toBe('con');
  });

  test('a mass noun takes its quantifier', () => {
    expect(prepDet('con', { ...AGUA, definiteness: 'many' })).toBe('con mucha');
  });

  test('a proper name goes bare unless it is inherently articled', () => {
    expect(prepDet('en', AFRICA)).toBe('en');
    expect(prepDet('en', ANTARTIDA)).toBe('en la');
  });
});
