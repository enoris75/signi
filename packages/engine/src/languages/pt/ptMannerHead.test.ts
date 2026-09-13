import { describe, expect, test } from 'vitest';
import { AGUA, CUIDADO, MANEIRA, RAPOSA, TEMPO, VELOCIDADE } from './pt.fixtures.js';
import { ptMannerHead } from './ptMannerHead.js';

describe('ptMannerHead', () => {
  test('a noun with no manner relation is similative "como", keeping its determiner', () => {
    expect(ptMannerHead(RAPOSA, false)).toBe('como a');
    expect(ptMannerHead(AGUA, false)).toBe('como a');
    expect(ptMannerHead({ ...RAPOSA, definiteness: 'indefinite' }, false)).toBe('como uma');
  });

  test('means is "com", which never fuses with the article', () => {
    expect(ptMannerHead({ ...CUIDADO, definiteness: 'bare' }, false)).toBe('com');
    expect(ptMannerHead(CUIDADO, false)).toBe('com o');
  });

  test('measure is "a", fused with the definite article', () => {
    expect(ptMannerHead(VELOCIDADE, false)).toBe('à');
    expect(ptMannerHead(TEMPO, true)).toBe('aos');
    expect(ptMannerHead({ ...VELOCIDADE, definiteness: 'bare' }, false)).toBe('a');
  });

  test('mode is "de", fused with the definite article or a demonstrative', () => {
    expect(ptMannerHead(MANEIRA, false)).toBe('da');
    expect(ptMannerHead({ ...MANEIRA, definiteness: 'this' }, false)).toBe('desta');
    expect(ptMannerHead({ ...MANEIRA, definiteness: 'indefinite' }, false)).toBe('de uma');
  });
});
