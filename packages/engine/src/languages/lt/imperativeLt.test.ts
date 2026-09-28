import { describe, expect, test } from 'vitest';
import { imperativeLt } from './imperativeLt.js';
import { BEGTI, GALETI, JUOKTIS, VALGYTI } from './lt.fixtures.js';

describe('imperativeLt', () => {
  test('the three persons, in the aspect asked for', () => {
    expect(imperativeLt(VALGYTI, true, '2sg', false)).toBe('suvalgyk');
    expect(imperativeLt(VALGYTI, true, '1pl', false)).toBe('suvalgykime');
    expect(imperativeLt(VALGYTI, false, '2pl', false)).toBe('valgykite');
    expect(imperativeLt(BEGTI, false, '2sg', false)).toBe('bėk');
  });

  test('negated: ne- written together', () => {
    expect(imperativeLt(VALGYTI, false, '2sg', true)).toBe('nevalgyk');
  });

  test('a suffix reflexive takes -si, and -si- after ne-', () => {
    expect(imperativeLt(JUOKTIS, false, '2sg', false)).toBe('juokis');
    expect(imperativeLt(JUOKTIS, false, '2pl', false)).toBe('juokitės');
    expect(imperativeLt(JUOKTIS, false, '2sg', true)).toBe('nesijuok');
  });

  test('a 3rd person is tegul + the present', () => {
    expect(imperativeLt(VALGYTI, true, '3sg', false)).toBe('tegul suvalgo');
    expect(imperativeLt(VALGYTI, false, '3pl', true)).toBe('tegul nevalgo');
  });

  test('a modal has none', () => {
    expect(imperativeLt({ ...GALETI, '2sg_imperative': undefined as unknown as string }, false, '2sg', false)).toBeUndefined();
  });
});
