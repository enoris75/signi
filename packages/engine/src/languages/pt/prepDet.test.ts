import { describe, expect, test } from 'vitest';
import { AFRICA, AGUA, CASA, CUIDADO, GATO } from './pt.fixtures.js';
import { prepDet } from './prepDet.js';

describe('prepDet', () => {
  test('the preposition stays apart from the definite article', () => {
    expect(prepDet('para', CASA)).toBe('para a');
    expect(prepDet('com', GATO, true)).toBe('com os');
  });

  test('carries whatever determiner was picked', () => {
    expect(prepDet('para', { ...CASA, definiteness: 'indefinite' })).toBe('para uma');
    expect(prepDet('com', { ...GATO, definiteness: 'many' }, true)).toBe('com muitos');
    expect(prepDet('como', { ...CASA, definiteness: 'this' })).toBe('como esta');
    expect(prepDet('com', { ...CUIDADO, definiteness: 'many' })).toBe('com muito');
  });

  test('a bare noun leaves the preposition alone', () => {
    expect(prepDet('para', { ...CASA, definiteness: 'bare' })).toBe('para');
    expect(prepDet('com', { ...AGUA, definiteness: 'indefinite' })).toBe('com');
  });

  test('a proper noun keeps its definite article', () => {
    expect(prepDet('para', { ...AFRICA, definiteness: 'indefinite' })).toBe('para a');
  });
});
