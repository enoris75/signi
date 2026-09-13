import { describe, expect, test } from 'vitest';
import { ALTO, adj, el, np, VELOCIDAD } from './es.fixtures.js';
import { isMannerGloss } from './isMannerGloss.js';

describe('isMannerGloss', () => {
  test('a single conjunct flagged as a manner gloss is one', () => {
    expect(isMannerGloss(el(np(VELOCIDAD, { definiteness: 'bare' }, { adjectives: [adj(ALTO)], mannerGloss: true })))).toBe(true);
  });

  test('an unflagged phrase is not', () => {
    expect(isMannerGloss(el(np(VELOCIDAD, { definiteness: 'bare' }, { adjectives: [adj(ALTO)] })))).toBe(false);
    expect(isMannerGloss(el(np(VELOCIDAD, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('a coordination is never a gloss, even when flagged', () => {
    const flagged = np(VELOCIDAD, { definiteness: 'bare' }, { mannerGloss: true });
    expect(isMannerGloss(el(flagged, flagged))).toBe(false);
  });
});
