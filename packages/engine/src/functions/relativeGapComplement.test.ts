import { describe, expect, test } from 'vitest';
import type { ResolvedRelativeClause } from '../types.js';
import { adj, el, np, vp } from '../languages/resolved.fixtures.js';
import { relativeGapComplement } from './relativeGapComplement.js';

const CAT = { base: 'cat', animate: '1' };
const EAT = { base: 'eat' };
const HOUSE = {
  base: 'house', plural: 'houses', definiteness: 'definite', alarm: '1',
  gender: 'fem', number: 'singular', count: 'singular', animate: '0', human: '0', mannerRelation: 'mode', temporal: '0',
};
const WHICH = { base: 'which' };

const clause = (rest: Partial<ResolvedRelativeClause>): ResolvedRelativeClause =>
  ({ headRole: 'locative', subject: el(np(CAT)), verbPhrase: vp(EAT), ...rest });

describe('relativeGapComplement', () => {
  test('a phrase with no relative clause has no gap', () => {
    expect(relativeGapComplement(np(HOUSE), WHICH)).toBeUndefined();
  });

  test.each(['subject', 'directObject', 'predicative', 'agent'] as const)('a %s gap is no complement', (headRole) => {
    expect(relativeGapComplement(np(HOUSE, {}, { relative: clause({ headRole }) }), WHICH)).toBeUndefined();
  });

  // A62: "the house the cat eats IN" renders its relativizer through the complement path, "in which".
  test('a complement gap is a one-complement map on a relativizer stand-in for the head', () => {
    const house = np(HOUSE, {}, { adjectives: [adj({ base: 'old' })], relative: clause({}) });
    const forms = {
      gender: 'fem', number: 'singular', count: 'singular', animate: '0', human: '0', mannerRelation: 'mode', temporal: '0',
      base: 'which',
    };
    expect(relativeGapComplement(house, WHICH)).toStrictEqual({
      locative: {
        phrase: {
          conjuncts: [{ head: { conceptId: '', forms }, adjectives: [], nounModifiers: [] }],
          agreement: forms,
        },
      },
    });
  });

  test('the stand-in keeps only the agreement forms the head has', () => {
    const thing = np({ base: 'thing', gender: 'masc' }, {}, { relative: clause({ headRole: 'source' }) });
    expect(relativeGapComplement(thing, WHICH)?.source?.phrase.agreement).toStrictEqual({ gender: 'masc', base: 'which' });
  });

  test("the relativizer's forms win over the head's", () => {
    const house = np(HOUSE, {}, { relative: clause({}) });
    expect(relativeGapComplement(house, { base: 'que', number: 'plural' })?.locative?.phrase.agreement['number']).toBe('plural');
  });

  test("the gap's specifiers ride along on the complement", () => {
    const house = np(HOUSE, {}, { relative: clause({ headSpecifiers: [{ kind: 'path', value: 'under' }] }) });
    expect(relativeGapComplement(house, WHICH)?.locative?.specifiers).toEqual([{ kind: 'path', value: 'under' }]);
  });
});
