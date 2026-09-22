import { describe, expect, test } from 'vitest';
import { el, np } from '../languages/resolved.fixtures.js';
import { isComplementGloss } from './isComplementGloss.js';

const PLACE = { base: 'place', plural: 'places', count: 'singular' };
const GROUP = { base: 'group', plural: 'groups', count: 'singular' };

describe('isComplementGloss', () => {
  test('is true for a single conjunct naming the complement it is', () => {
    expect(isComplementGloss(el(np(PLACE, {}, { complementGloss: { type: 'locative' } })))).toBe(true);
    expect(isComplementGloss(el(np(PLACE, {}, { complementGloss: { type: 'direction', specifiers: [{ kind: 'path', value: 'in' }] } })))).toBe(true);
  });

  test('is false when the phrase names none, or is another kind of gloss', () => {
    expect(isComplementGloss(el(np(PLACE)))).toBe(false);
    expect(isComplementGloss(el(np(PLACE, {}, { mannerGloss: true })))).toBe(false);
    expect(isComplementGloss(el(np(PLACE, {}, { dimensionGloss: true })))).toBe(false);
  });

  test('is false for a coordination, even of flagged conjuncts', () => {
    const flagged = el(np(PLACE, {}, { complementGloss: { type: 'locative' } }), np(GROUP, {}, { complementGloss: { type: 'locative' } }));
    expect(isComplementGloss(flagged)).toBe(false);
  });
});
