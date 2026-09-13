import { describe, expect, test } from 'vitest';
import { adj, CARE, el, FOX, type Forms, GOOD, GREAT, HIGH, np, SPEED, TIME, WAY } from './en.fixtures.js';
import { mannerGloss } from './mannerGloss.js';

/** A manner-noun gloss phrase with its own determiner and adjectives. */
const gloss = (forms: Forms, extra: Forms = {}, ...adjectives: ReturnType<typeof adj>[]) => {
  const phrase = np(forms, extra, { adjectives, mannerGloss: true });
  return mannerGloss(phrase, el(phrase));
};

describe('mannerGloss', () => {
  test('measure takes "at"', () => {
    expect(gloss(SPEED, { definiteness: 'bare' }, adj(HIGH))).toBe('at high speed');
    expect(gloss(SPEED)).toBe('at the speed');
  });

  test('the phrase keeps its own determiner and number', () => {
    expect(gloss(TIME, { definiteness: 'all', number: 'plural' })).toBe('at all times');
    expect(gloss(TIME, { definiteness: 'no' })).toBe('at no time');
  });

  test('mode takes "in"', () => {
    expect(gloss(WAY, { definiteness: 'indefinite' }, adj(GOOD))).toBe('in a good way');
    expect(gloss(WAY, { definiteness: 'this' })).toBe('in this way');
  });

  test('means takes "with"', () => {
    expect(gloss(CARE, { definiteness: 'bare' })).toBe('with care');
    expect(gloss(CARE, { definiteness: 'bare' }, adj(GREAT))).toBe('with great care');
  });

  test('a noun with no manner relation is similative "like"', () => {
    expect(gloss(FOX)).toBe('like the fox');
  });
});
