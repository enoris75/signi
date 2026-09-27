import { describe, expect, test } from 'vitest';
import { CASA, HISTORIA } from './ca.fixtures.js';
import { caSurface } from './caSurface.js';
import { joinHead } from './joinHead.js';

describe('joinHead', () => {
  test('joins a head and its noun with a space', () => {
    expect(joinHead('la', 'casa', CASA)).toBe('la casa');
    expect(joinHead('', 'casa', CASA)).toBe('casa');
  });

  test('a no_elision noun right after la keeps it whole through caSurface', () => {
    expect(caSurface(joinHead('la', 'història', HISTORIA))).toBe('la història');
    expect(caSurface(joinHead('de la', 'història', HISTORIA))).toBe('de la història');
  });

  test('the flag is the noun\'s: a prenominal adjective in between takes the ordinary join', () => {
    expect(joinHead('la', 'altra història', HISTORIA, { pre: 'altra', post: '' })).toBe('la altra història');
  });
});
