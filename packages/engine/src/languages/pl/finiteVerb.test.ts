import { describe, expect, test } from 'vitest';
import { finiteVerb } from './finiteVerb.js';
import { JESC } from './pl.fixtures.js';
import type { VerbAgr } from './pl.types.js';

const HE: VerbAgr = { person: '3', plural: false, gender: 'masc', virile: false };
const I: VerbAgr = { person: '1', plural: false, gender: 'masc', virile: false };

describe('finiteVerb', () => {
  test('each tense in its aspect', () => {
    expect(finiteVerb(JESC, HE, 'present', undefined, false)).toBe('je');
    expect(finiteVerb(JESC, HE, 'past', undefined, true)).toBe('zjadł');
    expect(finiteVerb(JESC, HE, 'past', undefined, false)).toBe('jadł');
    expect(finiteVerb(JESC, HE, 'future', undefined, true)).toBe('zje');
    expect(finiteVerb(JESC, HE, 'future', undefined, false)).toBe('będzie jadł');
  });

  test('the conditional and the gdyby participle', () => {
    expect(finiteVerb(JESC, I, 'present', 'conditional', true)).toBe('zjadłbym');
    expect(finiteVerb(JESC, I, 'past', 'subjunctive', false)).toBe('jadł');
  });

  test('a Romance mood Polish lacks is the indicative', () => {
    expect(finiteVerb(JESC, HE, 'present', 'presentSubjunctive', false)).toBe('je');
  });
});
