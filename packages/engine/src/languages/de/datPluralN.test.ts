import { describe, expect, test } from 'vitest';
import { datPluralN } from './datPluralN.js';

describe('datPluralN', () => {
  test('adds -n to a dative plural', () => {
    expect(datPluralN('Häuser', 'dat', true)).toBe('Häusern');
    expect(datPluralN('Boote', 'dat', true)).toBe('Booten');
  });

  test('leaves a plural already ending in -n or -s alone', () => {
    expect(datPluralN('Katzen', 'dat', true)).toBe('Katzen');
    expect(datPluralN('Autos', 'dat', true)).toBe('Autos');
  });

  test('touches nothing outside the dative plural', () => {
    expect(datPluralN('Häuser', 'nom', true)).toBe('Häuser');
    expect(datPluralN('Häuser', 'gen', true)).toBe('Häuser');
    expect(datPluralN('Kater', 'dat', false)).toBe('Kater');
    expect(datPluralN('', 'dat', true)).toBe('');
  });
});
