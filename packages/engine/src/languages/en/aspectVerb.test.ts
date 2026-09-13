import { describe, expect, test } from 'vitest';
import { BE, CHOOSE, EAT, GO, HE, I, RUN, SEE, THEY, WE, YOU } from './en.fixtures.js';
import { aspectVerb } from './aspectVerb.js';

describe('aspectVerb', () => {
  test('progressive: be + the gerund', () => {
    expect(aspectVerb(EAT, HE, 'present', 'progressive', false)).toBe('is eating');
    expect(aspectVerb(RUN, THEY, 'past', 'progressive', false)).toBe('were running');
    expect(aspectVerb(EAT, I, 'future', 'progressive', false)).toBe('will be eating');
  });

  test('prospective: be + about to + the base', () => {
    expect(aspectVerb(GO, I, 'present', 'prospective', false)).toBe('am about to go');
    expect(aspectVerb(EAT, HE, 'past', 'prospective', false)).toBe('was about to eat');
  });

  test('resultative: have + the past participle', () => {
    expect(aspectVerb(SEE, HE, 'present', 'resultative', false)).toBe('has seen');
    expect(aspectVerb(EAT, WE, 'past', 'resultative', false)).toBe('had eaten');
    expect(aspectVerb(CHOOSE, YOU, 'future', 'resultative', false)).toBe('will have chosen');
    expect(aspectVerb(BE, HE, 'present', 'resultative', false)).toBe('has been');
  });

  test('resultative of a verb whose perfect selects be: be + the past participle', () => {
    expect(aspectVerb(GO, HE, 'present', 'resultative', false)).toBe('is gone');
    expect(aspectVerb(GO, THEY, 'past', 'resultative', false)).toBe('were gone');
  });

  test('not follows the first auxiliary', () => {
    expect(aspectVerb(EAT, HE, 'present', 'progressive', true)).toBe('is not eating');
    expect(aspectVerb(GO, HE, 'present', 'prospective', true)).toBe('is not about to go');
    expect(aspectVerb(SEE, I, 'present', 'resultative', true)).toBe('have not seen');
    expect(aspectVerb(EAT, HE, 'future', 'progressive', true)).toBe('will not be eating');
    expect(aspectVerb(SEE, THEY, 'future', 'resultative', true)).toBe('will not have seen');
  });
});
