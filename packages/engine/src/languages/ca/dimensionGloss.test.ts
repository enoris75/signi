import { describe, expect, test } from 'vitest';
import type { ResolvedNounPhrase } from '../../types.js';
import { adj, ALT, el, type Forms, GRAN, MIDA, np, QUALITAT, TEMPERATURA } from './ca.fixtures.js';
import { dimensionGloss } from './dimensionGloss.js';

const EDAT: Forms = { base: 'edat', plural: 'edats', gender: 'fem', count: 'singular' };
const gloss = (phrase: ResolvedNounPhrase) => dimensionGloss(phrase, el(phrase));
const bare = (forms: Forms, ...adjectives: Forms[]) =>
  np(forms, { definiteness: 'bare' }, { adjectives: adjectives.map((a) => adj(a)), dimensionGloss: true });

describe('dimensionGloss', () => {
  test('extent and quality take de, the adjective agreeing and following the noun', () => {
    expect(gloss(bare(MIDA, GRAN))).toBe('de mida gran');
    expect(gloss(bare(QUALITAT, ALT))).toBe('de qualitat alta');
  });

  test('measure takes a', () => {
    expect(gloss(bare(TEMPERATURA, ALT))).toBe('a temperatura alta');
  });

  test('de elides before a vowel', () => {
    expect(gloss(bare(EDAT))).toBe("d'edat");
    expect(gloss(np(MIDA, { definiteness: 'indefinite' }, { adjectives: [adj(GRAN)], dimensionGloss: true }))).toBe("d'una mida gran");
  });
});
