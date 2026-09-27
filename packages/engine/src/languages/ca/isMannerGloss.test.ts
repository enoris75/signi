import { describe, expect, test } from 'vitest';
import { ALT, adj, el, np, VELOCITAT } from './ca.fixtures.js';
import { isMannerGloss } from './isMannerGloss.js';

describe('isMannerGloss', () => {
  test('a single conjunct flagged as a manner gloss is one', () => {
    expect(isMannerGloss(el(np(VELOCITAT, { definiteness: 'bare' }, { adjectives: [adj(ALT)], mannerGloss: true })))).toBe(true);
  });

  test('an unflagged phrase is not', () => {
    expect(isMannerGloss(el(np(VELOCITAT, { definiteness: 'bare' }, { adjectives: [adj(ALT)] })))).toBe(false);
    expect(isMannerGloss(el(np(VELOCITAT, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('a coordination is never a gloss, even when flagged', () => {
    const flagged = np(VELOCITAT, { definiteness: 'bare' }, { mannerGloss: true });
    expect(isMannerGloss(el(flagged, flagged))).toBe(false);
  });
});
