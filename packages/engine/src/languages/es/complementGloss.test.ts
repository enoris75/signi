import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import { complement, el, type Forms, CASA, np } from './es.fixtures.js';
import { complementGloss } from './complementGloss.js';
import { complementsPhrase } from './complementsPhrase.js';

/** A verbless subject flagged as the `type` complement, with that complement's specifiers. */
const gloss = (extra: Forms, type: 'locative' | 'direction', specifiers?: Specifier[]) =>
  el(np(CASA, extra, { complementGloss: { type, ...(specifiers ? { specifiers } : {}) } }));
const UNDER: Specifier[] = [{ kind: 'path', value: 'under' }];
const INTO: Specifier[] = [{ kind: 'path', value: 'in' }];

describe('complementGloss', () => {
  test('a locative takes its default "en", and the phrase keeps its own determiner', () => {
    expect(complementGloss(gloss({ definiteness: 'all', number: 'plural' }, 'locative'))).toBe('en todas las casas');
  });

  test('a direction with no relation is the plain goal', () => {
    expect(complementGloss(gloss({ definiteness: 'indefinite' }, 'direction'))).toBe('a una casa');
    expect(complementGloss(gloss({}, 'direction'))).toBe('a la casa');
  });

  test('a relation is the complement\'s own: a place under it, a goal "en" it', () => {
    expect(complementGloss(gloss({}, 'locative', UNDER))).toBe('debajo de la casa');
    expect(complementGloss(gloss({}, 'direction', INTO))).toBe('en la casa');
  });

  test('it is exactly what a clause renders for the same complement', () => {
    for (const type of ['locative', 'direction'] as const) {
      const phrase = np(CASA, { definiteness: 'indefinite' });
      expect(complementGloss(gloss({ definiteness: 'indefinite' }, type)))
        .toBe(complementsPhrase({ [type]: complement(phrase) }, {}, ''));
    }
  });
});
