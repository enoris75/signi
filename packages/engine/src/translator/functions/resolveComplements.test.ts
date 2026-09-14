import { describe, expect, test } from 'vitest';
import type { Complement, ComplementType, NounElement, Specifier } from '@signi/shared';
import { LOOKUP } from '../translator.fixtures.js';
import { resolveComplements } from './resolveComplements.js';

type Complements = Partial<Record<ComplementType, Complement>>;
const resolveIt = (complements: Complements | undefined) => resolveComplements(complements, 'it', LOOKUP);

/** Each conjunct's resolved determiner in the complement of `type`. */
function determiners(type: ComplementType, phrase: NounElement): string[] | undefined {
  return resolveIt({ [type]: { phrase } })?.[type]?.phrase.conjuncts.map((c) => c.head.forms['definiteness']);
}

describe('resolveComplements', () => {
  test('no complements resolve to none', () => {
    expect(resolveIt(undefined)).toBeUndefined();
    expect(resolveIt({})).toEqual({});
  });

  test('each complement resolves its phrase and carries its specifiers as they are', () => {
    const specifiers: Specifier[] = [{ kind: 'path', value: 'under' }];
    const { locative } = resolveIt({ locative: { phrase: { concept: 'HOUSE' }, specifiers } })!;
    expect(locative?.phrase.conjuncts[0].head.forms['base']).toBe('casa');
    expect(locative?.specifiers).toEqual(specifiers);
    expect(locative?.action).toBeUndefined();
  });

  test('an unchosen determiner is indefinite for a predicative and definite elsewhere; a chosen one stays', () => {
    expect(determiners('predicative', { concept: 'CAT' })).toEqual(['indefinite']);
    expect(determiners('source', { concept: 'CAT' })).toEqual(['definite']);
    expect(determiners('predicative', { concept: 'CAT', definiteness: 'this' })).toEqual(['this']);
  });

  test('each conjunct of a coordinated complement takes its own default', () => {
    const phrase: NounElement = { conjuncts: [{ concept: 'CAT' }, { concept: 'DOG', definiteness: 'definite' }], conjunction: 'or' };
    expect(determiners('predicative', phrase)).toEqual(['indefinite', 'definite']);
    expect(resolveIt({ predicative: { phrase } })?.predicative?.phrase.conjunction).toBe('or');
  });

  test("an instrument's action resolves with no mood of its own", () => {
    const { instrumental } = resolveIt({ instrumental: { phrase: { concept: 'HOUSE' }, action: { verb: 'CHOOSE' } } })!;
    expect(instrumental?.action).toMatchObject({ verb: { conceptId: 'CHOOSE' }, mood: undefined, register: undefined });
  });

  test('a slot with no phrase, or with a conjunct naming no concept, is left out', () => {
    const resolved = resolveIt({
      locative: undefined,
      source: { phrase: { concept: '' } },
      direction: { phrase: { conjuncts: [{ concept: 'CAT' }, { concept: '' }], conjunction: 'and' } },
      cause: { specifiers: [] } as unknown as Complement,
      route: { phrase: { concept: 'HOUSE' } },
    });
    expect(Object.keys(resolved!)).toEqual(['route']);
  });

  describe('a manner adverbial', () => {
    test('an adjective-modified measure noun names a generic rate, and goes bare', () => {
      expect(determiners('manner', { concept: 'SPEED', adjectives: ['BIG'] })).toEqual(['bare']);
    });

    test('a bare measure noun, or a possessed one, keeps its article', () => {
      expect(determiners('manner', { concept: 'SPEED' })).toEqual(['definite']);
      expect(determiners('manner', { concept: 'SPEED', adjectives: ['BIG'], possessor: { concept: 'CAT' } })).toEqual(['definite']);
    });

    test('a noun of any other manner relation keeps its article', () => {
      expect(determiners('manner', { concept: 'WAY', adjectives: ['BIG'] })).toEqual(['definite']);
    });

    test('only the manner slot goes bare', () => {
      expect(determiners('locative', { concept: 'SPEED', adjectives: ['BIG'] })).toEqual(['definite']);
    });

    test('each conjunct decides for itself', () => {
      const phrase: NounElement = { conjuncts: [{ concept: 'SPEED', adjectives: ['BIG'] }, { concept: 'SPEED' }], conjunction: 'and' };
      expect(determiners('manner', phrase)).toEqual(['bare', 'definite']);
    });
  });
});
