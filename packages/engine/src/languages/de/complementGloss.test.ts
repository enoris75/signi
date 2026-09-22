import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import { complement, el, type Forms, HAUS, np } from './de.fixtures.js';
import { complementGloss } from './complementGloss.js';
import { complementsPhrase } from './complementsPhrase/index.js';

/** A verbless subject flagged as the `type` complement, with that complement's specifiers. */
const gloss = (extra: Forms, type: 'locative' | 'direction', specifiers?: Specifier[]) =>
  el(np(HAUS, extra, { complementGloss: { type, ...(specifiers ? { specifiers } : {}) } }));
const UNDER: Specifier[] = [{ kind: 'path', value: 'under' }];
const INTO: Specifier[] = [{ kind: 'path', value: 'in' }];

describe('complementGloss', () => {
  test('a locative takes its default "in" and the dative, and the phrase keeps its own determiner', () => {
    expect(complementGloss(gloss({ definiteness: 'all', number: 'plural' }, 'locative'))).toBe('in allen Häusern');
  });

  test('a direction with no relation is the plain goal', () => {
    expect(complementGloss(gloss({ definiteness: 'indefinite' }, 'direction'))).toBe('zu einem Haus');
    expect(complementGloss(gloss({}, 'direction'))).toBe('zum Haus');
  });

  test('a relation is the complement\'s own: a place under it, a goal "in" it, in the accusative of motion', () => {
    expect(complementGloss(gloss({}, 'locative', UNDER))).toBe('unter dem Haus');
    expect(complementGloss(gloss({}, 'direction', INTO))).toBe('ins Haus');
  });

  test('it is exactly what a clause renders for the same complement', () => {
    for (const type of ['locative', 'direction'] as const) {
      const phrase = np(HAUS, { definiteness: 'indefinite' });
      expect(complementGloss(gloss({ definiteness: 'indefinite' }, type)))
        .toBe(complementsPhrase({ [type]: complement(phrase) }));
    }
  });
});
