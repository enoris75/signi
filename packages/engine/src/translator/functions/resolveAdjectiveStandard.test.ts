import { describe, expect, test } from 'vitest';
import type { Degree, NounPhrase } from '@signi/shared';
import { LOOKUP } from '../translator.fixtures.js';
import { resolveAdjectiveStandard } from './resolveAdjectiveStandard.js';
import { resolveNounPhrase } from './resolveNounPhrase.js';

const DOG = { concept: 'DOG' };
const CAT = { concept: 'CAT' };
const phrase = (adjectiveDegrees: Degree[], adjectiveStandards: NounPhrase['adjectiveStandards'], adjectives = ['BIG', 'BIG']): NounPhrase =>
  ({ concept: 'CAT', adjectives, adjectiveDegrees, adjectiveStandards });

describe('resolveAdjectiveStandard', () => {
  test('the comparatives and the equative take one', () => {
    for (const degree of ['more', 'less', 'equally'] as const) {
      const found = resolveAdjectiveStandard(phrase([degree], [DOG], ['BIG']), 'it', LOOKUP);
      expect(found?.planIndex).toBe(0);
      expect(found?.standard.conjuncts.map((c) => c.head.forms['base'])).toEqual(['cane']);
    }
  });

  test('positive takes none', () => {
    expect(resolveAdjectiveStandard(phrase(['positive'], [DOG], ['BIG']), 'it', LOOKUP)).toBeUndefined();
  });

  test('the superlatives take one as their set (A371)', () => {
    for (const degree of ['most', 'least'] as const) {
      const found = resolveAdjectiveStandard(phrase([degree], [DOG], ['BIG']), 'it', LOOKUP);
      expect(found?.planIndex).toBe(0);
      expect(found?.domain).toBe(true);
    }
    expect(resolveAdjectiveStandard(phrase(['more'], [DOG], ['BIG']), 'it', LOOKUP)?.domain).toBe(false);
  });

  test('at most one: the first compared adjective whose entry is set', () => {
    expect(resolveAdjectiveStandard(phrase(['more', 'more'], [DOG, CAT]), 'it', LOOKUP)?.planIndex).toBe(0);
    expect(resolveAdjectiveStandard(phrase(['positive', 'more'], [DOG, CAT]), 'it', LOOKUP)?.planIndex).toBe(1);
    expect(resolveAdjectiveStandard(phrase(['more', 'more'], [undefined, CAT]), 'it', LOOKUP)?.planIndex).toBe(1);
  });
});

describe('resolveNounPhrase: the attributive standard', () => {
  test('carries the standard with the adjective\'s index and marks that adjective alone', () => {
    const np = resolveNounPhrase(
      { concept: 'CAT', adjectives: ['OLD', 'BIG'], adjectiveDegrees: ['positive', 'equally'], adjectiveStandards: [undefined, DOG] },
      'it', LOOKUP,
    );
    expect(np.adjectiveStandard?.index).toBe(1);
    expect(np.adjectiveStandard?.standard.conjuncts[0]?.head.forms['base']).toBe('cane');
    expect(np.adjectives[1]?.forms['standard']).toBe('1');
    expect(np.adjectives[0]?.forms).not.toHaveProperty('standard');
    expect(np.standard).toBeUndefined();
  });

  test('marks a superlative\'s set as its domain, never as a standard (A371)', () => {
    const np = resolveNounPhrase({ concept: 'CAT', adjectives: ['BIG'], adjectiveDegrees: ['most'], adjectiveStandards: [DOG] }, 'it', LOOKUP);
    expect(np.adjectiveStandard?.index).toBe(0);
    expect(np.adjectives[0]?.forms['domain']).toBe('1');
    expect(np.adjectives[0]?.forms).not.toHaveProperty('standard');
  });

  test('none on a phrase without one', () => {
    expect(resolveNounPhrase({ concept: 'CAT', adjectives: ['BIG'], adjectiveDegrees: ['more'] }, 'it', LOOKUP).adjectiveStandard).toBeUndefined();
  });
});
