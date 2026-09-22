import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import { complement, el, type Forms, HOUSE, np } from './en.fixtures.js';
import { complementGloss } from './complementGloss.js';
import { complementsPhrase } from './complementsPhrase.js';

/** A verbless subject flagged as the `type` complement, with that complement's specifiers. */
const gloss = (extra: Forms, type: 'locative' | 'direction', specifiers?: Specifier[]) =>
  el(np(HOUSE, extra, { complementGloss: { type, ...(specifiers ? { specifiers } : {}) } }));
const UNDER: Specifier[] = [{ kind: 'path', value: 'under' }];
const INTO: Specifier[] = [{ kind: 'path', value: 'in' }];

describe('complementGloss', () => {
  test('a locative takes its default "in", and the phrase keeps its own determiner', () => {
    expect(complementGloss(gloss({ definiteness: 'all', number: 'plural' }, 'locative'))).toBe('in all houses');
  });

  test('a direction with no relation is the plain goal', () => {
    expect(complementGloss(gloss({ definiteness: 'indefinite' }, 'direction'))).toBe('to a house');
    expect(complementGloss(gloss({}, 'direction'))).toBe('to the house');
  });

  test('a relation is the complement\'s own: a place under it, a goal "into" it', () => {
    expect(complementGloss(gloss({}, 'locative', UNDER))).toBe('under the house');
    expect(complementGloss(gloss({}, 'direction', INTO))).toBe('into the house');
  });

  test('it is exactly what a clause renders for the same complement', () => {
    for (const type of ['locative', 'direction'] as const) {
      const phrase = np(HOUSE, { definiteness: 'indefinite' });
      expect(complementGloss(gloss({ definiteness: 'indefinite' }, type)))
        .toBe(complementsPhrase({ [type]: complement(phrase) }));
    }
  });
});
