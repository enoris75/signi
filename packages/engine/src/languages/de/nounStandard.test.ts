import { describe, expect, test } from 'vitest';
import { adj, el, GROSS, ICH, KATER, MANN, np } from './de.fixtures.js';
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

  test('nothing without one', () => {
    expect(nounStandard(np(KATER, {}, { adjectives: [adj(GROSS, { degree: 'more' })] }), 'nom')).toBe('');
  });
});
