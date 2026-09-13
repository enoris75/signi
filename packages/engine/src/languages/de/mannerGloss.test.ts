import { describe, expect, test } from 'vitest';
import { adj, el, GESCHWINDIGKEIT, GROSS, GUT, HOCH, np, SORGFALT, WEISE, WIND } from './de.fixtures.js';
import { mannerGloss } from './mannerGloss.js';

describe('mannerGloss', () => {
  test('measure and means take "mit" + dative', () => {
    expect(mannerGloss(el(np(GESCHWINDIGKEIT, { definiteness: 'bare' }, { adjectives: [adj(HOCH)], mannerGloss: true }))))
      .toBe('mit hoher Geschwindigkeit');
    expect(mannerGloss(el(np(SORGFALT, { definiteness: 'bare' }, { adjectives: [adj(GROSS)], mannerGloss: true }))))
      .toBe('mit großer Sorgfalt');
  });

  test('mode takes "auf" + accusative, keeping the phrase’s own determiner', () => {
    expect(mannerGloss(el(np(WEISE, { definiteness: 'indefinite' }, { adjectives: [adj(GUT)], mannerGloss: true }))))
      .toBe('auf eine gute Weise');
    expect(mannerGloss(el(np(WEISE, { definiteness: 'this' }, { mannerGloss: true })))).toBe('auf diese Weise');
  });

  test('a noun with no manner relation is similative "wie" + nominative', () => {
    expect(mannerGloss(el(np(WIND, {}, { mannerGloss: true })))).toBe('wie der Wind');
  });
});
