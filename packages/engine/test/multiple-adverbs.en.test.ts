import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// P15: a verb takes several adverbs. English puts a frequency adverb before the verb and a manner or
// place adverb after it and its object.
const en = (plan: PhrasePlan): string => sayAll(plan).en;
const run = (verbPhrase: Partial<VerbPhrase>) => en(clause(np('CAT'), 'RUN', { verbPhrase }));

describe('several adverbs (en)', () => {
  test('frequency + manner', () => {
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'] })).toBe('the cat often runs fast.');
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'], negative: true })).toBe('the cat does not often run fast.');
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' })).toBe('the cat had often run fast.');
    expect(run({ modifier: 'OFTEN', modifiers: ['FAST'], modals: ['MUST'] })).toBe('the cat must often run fast.');
  });
});

// A386. ALREADY under a negation is "yet", which closes the clause: "does not run fast yet". As the
// primary it takes the manner adverb's place, and the manner extra follows it: "does not run yet fast".
describe('known bugs: English "yet" ahead of a further adverb (A386)', () => {
  test.fails('"yet" follows the manner adverb', () => {
    expect(run({ modifier: 'ALREADY', modifiers: ['FAST'], negative: true })).toBe('the cat does not run fast yet.');
  });

  test('regression: "yet" alone, and ALREADY in a positive clause', () => {
    expect(run({ modifier: 'ALREADY', negative: true })).toBe('the cat does not run yet.');
    expect(run({ modifier: 'ALREADY', modifiers: ['FAST'] })).toBe('the cat already runs fast.');
  });
});
