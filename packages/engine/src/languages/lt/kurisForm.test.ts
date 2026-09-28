import { describe, expect, test } from 'vitest';
import { kurisForm } from './kurisForm.js';

describe('kurisForm', () => {
  test('agrees with the head and takes the case of its role', () => {
    expect(kurisForm('nom', { gender: 'masc', plural: false })).toBe('kuris');
    expect(kurisForm('nom', { gender: 'fem', plural: false })).toBe('kuri');
    expect(kurisForm('acc', { gender: 'fem', plural: false })).toBe('kurią');
    expect(kurisForm('acc', { gender: 'masc', plural: false })).toBe('kurį');
    expect(kurisForm('loc', { gender: 'masc', plural: false })).toBe('kuriame');
    expect(kurisForm('nom', { gender: 'masc', plural: true })).toBe('kurie');
    expect(kurisForm('gen', { gender: 'fem', plural: true })).toBe('kurių');
    expect(kurisForm('dat', { gender: 'masc', plural: false })).toBe('kuriam');
    expect(kurisForm('acc', { gender: 'masc', plural: true })).toBe('kuriuos');
  });

  test('kas after an indefinite pronoun', () => {
    expect(kurisForm('nom', { gender: 'masc', plural: false }, true)).toBe('kas');
    expect(kurisForm('gen', { gender: 'masc', plural: false }, true)).toBe('ko');
  });
});
