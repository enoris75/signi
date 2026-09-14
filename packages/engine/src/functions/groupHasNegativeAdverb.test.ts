import { describe, expect, test } from 'vitest';
import { concept, modal, vp } from '../languages/resolved.fixtures.js';
import { groupHasNegativeAdverb } from './groupHasNegativeAdverb.js';

const GO = { base: 'go' };
const WANT = { base: 'want', link: 'to' };
const NEVER = { base: 'never', polarity: 'negative', subtype: 'frequency' };
const ALWAYS = { base: 'always', subtype: 'frequency' };

describe('groupHasNegativeAdverb', () => {
  test('a negative adverb on the main verb', () => {
    expect(groupHasNegativeAdverb(vp(GO, { modifier: concept(NEVER) }))).toBe(true);
  });

  test('a negative adverb on any modal, not only the finite one', () => {
    expect(groupHasNegativeAdverb(vp(GO, { modals: [modal(WANT, NEVER)] }))).toBe(true);
    expect(groupHasNegativeAdverb(vp(GO, { modals: [modal(WANT), modal(WANT, NEVER)] }))).toBe(true);
  });

  test('a group with no adverb, or only positive ones, is not negated', () => {
    expect(groupHasNegativeAdverb(vp(GO))).toBe(false);
    expect(groupHasNegativeAdverb(vp(GO, { modifier: concept(ALWAYS), modals: [modal(WANT, ALWAYS)] }))).toBe(false);
  });
});
