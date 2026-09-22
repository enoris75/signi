import { describe, expect, test } from 'vitest';
import { concept, modal, vp } from '../languages/resolved.fixtures.js';
import { finiteHasNegativeAdverb } from './finiteHasNegativeAdverb.js';

const GO = { base: 'go' };
const WANT = { base: 'want', link: 'to' };
const NEVER = { base: 'never', polarity: 'negative', subtype: 'frequency' };
const ALWAYS = { base: 'always', subtype: 'frequency' };

describe('finiteHasNegativeAdverb', () => {
  test('the main verb of a modal-free clause is the finite one', () => {
    expect(finiteHasNegativeAdverb(vp(GO, { modifier: concept(NEVER) }))).toBe(true);
  });

  test("a modal's own negative adverb denies the finite element, wherever in the chain it sits", () => {
    expect(finiteHasNegativeAdverb(vp(GO, { modals: [modal(WANT, NEVER)] }))).toBe(true);
    expect(finiteHasNegativeAdverb(vp(GO, { modals: [modal(WANT), modal(WANT, NEVER)] }))).toBe(true);
  });

  test("the main verb's adverb under a modal does not: it denies the group the modal governs (A236)", () => {
    expect(finiteHasNegativeAdverb(vp(GO, { modifier: concept(NEVER), modals: [modal(WANT)] }))).toBe(false);
    // Both at once: the modal's is still the finite one's.
    expect(finiteHasNegativeAdverb(vp(GO, { modifier: concept(NEVER), modals: [modal(WANT, NEVER)] }))).toBe(true);
  });

  test('a group with no adverb, or only positive ones, is not negated', () => {
    expect(finiteHasNegativeAdverb(vp(GO))).toBe(false);
    expect(finiteHasNegativeAdverb(vp(GO, { modifier: concept(ALWAYS), modals: [modal(WANT, ALWAYS)] }))).toBe(false);
  });
});
