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

    // A226: the rule is for the definite, chosen or defaulted; any other determiner was asked for
    // and keeps its meaning ("at another time", "at no other time").
    test('only the definite goes bare; any other determiner stays', () => {
      expect(determiners('manner', { concept: 'SPEED', adjectives: ['BIG'], definiteness: 'definite' })).toEqual(['bare']);
      expect(determiners('manner', { concept: 'SPEED', adjectives: ['BIG'], definiteness: 'bare' })).toEqual(['bare']);
      for (const definiteness of ['indefinite', 'this', 'that', 'no'] as const) {
        expect(determiners('manner', { concept: 'SPEED', adjectives: ['BIG'], definiteness })).toEqual([definiteness]);
      }
      expect(determiners('manner', { concept: 'SPEED', adjectives: ['BIG'], definiteness: 'all', number: 'plural' })).toEqual(['all']);
    });

    test('a bare measure noun, or a possessed one, keeps its article', () => {
      expect(determiners('manner', { concept: 'SPEED' })).toEqual(['definite']);
      expect(determiners('manner', { concept: 'SPEED', adjectives: ['BIG'], possessor: { concept: 'CAT' } })).toEqual(['definite']);
    });

    // A235: a temporal measure names an occasion, not a rate, and keeps the article like any count
    // noun ("at the other time"); the determiners that already meant what they said still do.
    test('a temporal measure noun names an occasion, and keeps its article', () => {
      expect(determiners('manner', { concept: 'TIME', adjectives: ['BIG'] })).toEqual(['definite']);
      expect(determiners('manner', { concept: 'TIME', adjectives: ['BIG'], definiteness: 'definite', number: 'plural' })).toEqual(['definite']);
      expect(determiners('manner', { concept: 'TIME', adjectives: ['BIG'], definiteness: 'indefinite' })).toEqual(['indefinite']);
      const phrase: NounElement = { conjuncts: [{ concept: 'SPEED', adjectives: ['BIG'] }, { concept: 'TIME', adjectives: ['BIG'] }], conjunction: 'or' };
      expect(determiners('manner', phrase)).toEqual(['bare', 'definite']);
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
