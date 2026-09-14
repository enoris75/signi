import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../types.js';
import { modal } from '../languages/resolved.fixtures.js';
import { modalChain } from './modalChain.js';

const WANT = { base: 'want', '3sg_present': 'wants', link: 'to' };
const CAN = { base: 'can', '3sg_present': 'can', nonfinite: 'be able to' };
const VOLERE = { base: 'volere', '3sg_present': 'vuole' };
const POTERE = { base: 'potere', '3sg_present': 'può', nonfinite: 'poter' };

const finite = (verb: ConceptForms) => verb.forms['3sg_present'] ?? '';

describe('modalChain', () => {
  test('no modals, no words', () => {
    expect(modalChain([], finite)).toEqual([]);
  });

  test('the outermost modal alone takes the finite form, followed by its link', () => {
    expect(modalChain([modal(WANT)], finite)).toEqual(['wants', 'to']);
  });

  test('each inner modal takes its non-finite form, or its base when it has none', () => {
    expect(modalChain([modal(WANT), modal(CAN)], finite)).toEqual(['wants', 'to', 'be able to']);
    expect(modalChain([modal(VOLERE), modal(POTERE)], finite)).toEqual(['vuole', 'poter']);
    expect(modalChain([modal(POTERE), modal(VOLERE)], finite)).toEqual(['può', 'volere']);
  });

  test('an inner modal with neither form leaves no gap', () => {
    expect(modalChain([modal(WANT), modal({})], finite)).toEqual(['wants', 'to']);
  });

  test("each modal's adverb lands before or after it, as the caller places it by position", () => {
    const adverb = (m: { modifier?: ConceptForms }, i: number) =>
      i === 0 ? { post: m.modifier?.forms['base'] } : { pre: m.modifier?.forms['base'] };
    expect(modalChain([modal(VOLERE, { base: 'sempre' }), modal(POTERE, { base: 'bene' })], finite, adverb))
      .toEqual(['vuole', 'sempre', 'bene', 'poter']);
    expect(modalChain([modal(WANT)], finite, () => ({}))).toEqual(['wants', 'to']);
  });
});
