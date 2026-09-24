import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement } from '../../types.js';
import { negativeComplements, negativePolarity } from './negativePolarity.js';

const el = (forms: Record<string, string>): ResolvedNounElement =>
  ({ conjuncts: [{ head: { conceptId: 'SOMETHING', forms }, adjectives: [], nounModifiers: [] }], agreement: {} });
const head = (e: ResolvedNounElement | undefined) => e!.conjuncts[0].head.forms;

describe('negativePolarity', () => {
  test('swaps every surface for the negative one, and marks the concord', () => {
    const out = negativePolarity(el({ base: 'something', object: 'something', person: '3', negative: 'anything' }), true);
    expect(head(out)['base']).toBe('anything');
    expect(head(out)['object']).toBe('anything');
    expect(head(out)['definiteness']).toBe('no');
  });

  test('a slot-specific negative form wins over the citation one', () => {
    const out = negativePolarity(el({ base: '何か', reading: 'なにか', negative: '何', negative_reading: 'なに' }), true);
    expect(head(out)['base']).toBe('何');
    expect(head(out)['reading']).toBe('なに');
  });

  test('a form with no negative reading loses the positive one rather than keeping it', () => {
    const out = negativePolarity(el({ base: '何か', reading: 'なにか', negative: '何' }), true);
    expect(head(out)['reading']).toBeUndefined();
  });

  test('an affirmative clause, and a word with no negative form, are untouched', () => {
    const positive = el({ base: 'something', negative: 'anything' });
    expect(negativePolarity(positive, false)).toBe(positive);
    const cat = el({ base: 'cat' });
    expect(negativePolarity(cat, true)).toBe(cat);
    expect(negativePolarity(undefined, true)).toBeUndefined();
  });
});

// A308
describe('negativeComplements', () => {
  test('swaps the indefinite pronoun every complement holds, keeping the rest of the complement', () => {
    const out = negativeComplements({
      comitative: { phrase: el({ base: 'someone', disjunctive: 'someone', person: '3', negative: 'anyone' }) },
      locative: { phrase: el({ base: 'house' }), specifiers: [{ kind: 'path', value: 'in' }] },
    }, true);
    expect(head(out?.comitative?.phrase)['disjunctive']).toBe('anyone');
    expect(head(out?.comitative?.phrase)['definiteness']).toBe('no');
    expect(head(out?.locative?.phrase)['definiteness']).toBeUndefined();
    expect(out?.locative?.specifiers).toEqual([{ kind: 'path', value: 'in' }]);
  });

  test('an affirmative clause, and no complements, are untouched', () => {
    const complements = { comitative: { phrase: el({ base: 'someone', negative: 'anyone' }) } };
    expect(negativeComplements(complements, false)).toBe(complements);
    expect(negativeComplements(undefined, true)).toBeUndefined();
  });
});
