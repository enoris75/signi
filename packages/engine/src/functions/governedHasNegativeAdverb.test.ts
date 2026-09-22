import { describe, expect, test } from 'vitest';
import { concept, modal, vp } from '../languages/resolved.fixtures.js';
import { governedHasNegativeAdverb } from './governedHasNegativeAdverb.js';

const GO = { base: 'go' };
const WANT = { base: 'want', link: 'to' };
const NEVER = { base: 'never', polarity: 'negative', subtype: 'frequency' };
const ALWAYS = { base: 'always', subtype: 'frequency' };

describe('governedHasNegativeAdverb', () => {
  test("the main verb's negative adverb under a modal denies the governed group", () => {
    expect(governedHasNegativeAdverb(vp(GO, { modifier: concept(NEVER), modals: [modal(WANT)] }))).toBe(true);
    expect(governedHasNegativeAdverb(vp(GO, { modifier: concept(NEVER), modals: [modal(WANT), modal(WANT)] }))).toBe(true);
  });

  test('with no modal the main verb IS the finite one, so nothing is governed', () => {
    expect(governedHasNegativeAdverb(vp(GO, { modifier: concept(NEVER) }))).toBe(false);
  });

  test("a modal's own adverb is not the main verb's, and a positive adverb denies nothing", () => {
    expect(governedHasNegativeAdverb(vp(GO, { modals: [modal(WANT, NEVER)] }))).toBe(false);
    expect(governedHasNegativeAdverb(vp(GO, { modifier: concept(ALWAYS), modals: [modal(WANT)] }))).toBe(false);
    expect(governedHasNegativeAdverb(vp(GO, { modals: [modal(WANT)] }))).toBe(false);
  });
});
