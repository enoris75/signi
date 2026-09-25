import { describe, expect, test } from 'vitest';
import { adj, el, GROSS, HAUS, ICH, KATER, KATZE, MANN, np } from './de.fixtures.js';
import { nounPhrase } from './nounPhrase.js';
import { nounStandard } from './nounStandard.js';

const compared = (degree: string, standard = el(np(MANN, { definiteness: 'definite' }))) =>
  np(KATER, { definiteness: 'indefinite' }, { adjectives: [adj(GROSS, { degree, standard: '1' })], adjectiveStandard: { index: 0, standard } });

describe('nounStandard', () => {
  test('the standard in the phrase\'s own case', () => {
    expect(nounStandard(compared('more'), 'nom')).toBe(' als der Mann');
    expect(nounStandard(compared('more'), 'acc')).toBe(' als den Mann');
    expect(nounStandard(compared('more'), 'dat')).toBe(' als dem Mann');
    expect(nounStandard(compared('equally'), 'acc')).toBe(' wie den Mann');
  });

  test('a pronoun standard takes that case too', () => {
    expect(nounStandard(compared('more', el(np(ICH))), 'acc')).toBe(' als mich');
  });

  test('after the noun, the adjective declined before it as ever', () => {
    expect(nounPhrase(compared('more'), 'acc')).toBe('einen größeren Kater als den Mann');
    expect(nounPhrase(compared('equally'), 'nom')).toBe('ein so großer Kater wie der Mann');
  });

  // A380: behind a genitive possessor a superlative's set is a place, not a second genitive.
  const best = (set = el(np(HAUS, { definiteness: 'definite' })), possessor?: ReturnType<typeof np>) =>
    np(KATER, { definiteness: 'definite' }, {
      adjectives: [adj(GROSS, { degree: 'most', domain: '1' })], adjectiveStandard: { index: 0, standard: set },
      ...(possessor ? { possessor } : {}),
    });

  test('a superlative\'s set is the genitive, and "in" + dative behind a genitive possessor (A380)', () => {
    expect(nounStandard(best(), 'nom')).toBe(' des Hauses');
    expect(nounStandard(best(undefined, np(KATZE, { definiteness: 'definite' })), 'nom')).toBe(' im Haus');
    expect(nounStandard(best(el(np(KATZE, { definiteness: 'definite' })), np(MANN, { definiteness: 'definite' })), 'acc')).toBe(' in der Katze');
    expect(nounStandard(best(el(np(ICH)), np(MANN, { definiteness: 'definite' })), 'nom')).toBe(' von mir');
  });

  test('nothing without one', () => {
    expect(nounStandard(np(KATER, {}, { adjectives: [adj(GROSS, { degree: 'more' })] }), 'nom')).toBe('');
  });
});
