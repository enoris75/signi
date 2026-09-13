import { describe, expect, test } from 'vitest';
import { dimensionGloss } from './dimensionGloss.js';
import { adj, el, type Forms, GREAT, HIGH, LOW, np, QUALITY, SIZE, SPEED, TEMPERATURE } from './en.fixtures.js';

/** A bare dimension-noun gloss phrase, with its degree adjectives. */
const gloss = (forms: Forms, ...degrees: ReturnType<typeof adj>[]) => {
  const phrase = np(forms, { definiteness: 'bare' }, { adjectives: degrees, dimensionGloss: true });
  return dimensionGloss(phrase, el(phrase));
};

describe('dimensionGloss', () => {
  test('extent and quality take "of"', () => {
    expect(gloss(SIZE, adj(GREAT))).toBe('of great size');
    expect(gloss(QUALITY, adj(HIGH))).toBe('of high quality');
  });

  test('measure takes "at"', () => {
    expect(gloss(TEMPERATURE, adj(HIGH))).toBe('at high temperature');
    expect(gloss(TEMPERATURE, adj(LOW))).toBe('at low temperature');
  });

  test('a noun with no dimension relation defaults to extent', () => {
    expect(gloss(SPEED, adj(HIGH))).toBe('of high speed');
  });

  test('the degree adjective keeps its own comparison', () => {
    expect(gloss(SIZE, adj(GREAT, { degree: 'more' }))).toBe('of greater size');
  });

  test('without a degree the bare noun follows the preposition', () => {
    expect(gloss(SIZE)).toBe('of size');
  });
});
