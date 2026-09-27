import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import { CASA, complement, el, type Forms, np } from './ca.fixtures.js';
import { complementGloss } from './complementGloss.js';
import { complementsPhrase } from './complementsPhrase.js';

const gloss = (extra: Forms, type: 'locative' | 'direction', specifiers?: Specifier[]) =>
  el(np(CASA, extra, { complementGloss: { type, ...(specifiers ? { specifiers } : {}) } }));

describe('complementGloss', () => {
  test('a locative takes its default preposition, and the phrase keeps its own determiner', () => {
    expect(complementGloss(gloss({ definiteness: 'all', number: 'plural' }, 'locative'))).toBe('en totes les cases');
    expect(complementGloss(gloss({}, 'locative'))).toBe('a la casa');
  });

  test('a direction with no relation is the plain goal; a relation is its own', () => {
    expect(complementGloss(gloss({ definiteness: 'indefinite' }, 'direction'))).toBe('a una casa');
    expect(complementGloss(gloss({}, 'locative', [{ kind: 'path', value: 'under' }]))).toBe('sota la casa');
  });

  test('it is exactly what a clause renders for the same complement', () => {
    for (const type of ['locative', 'direction'] as const) {
      expect(complementGloss(gloss({ definiteness: 'indefinite' }, type)))
        .toBe(complementsPhrase({ [type]: complement(np(CASA, { definiteness: 'indefinite' })) }, {}, ''));
    }
  });
});
