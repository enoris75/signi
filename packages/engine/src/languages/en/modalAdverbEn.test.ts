import { describe, expect, test } from 'vitest';
import { ALWAYS, CAN, modal, MUST, NEVER, SLOWLY, WILL } from './en.fixtures.js';
import { modalAdverbEn } from './modalAdverbEn.js';

describe('modalAdverbEn', () => {
  test('a modal with no adverb places nothing', () => {
    expect(modalAdverbEn(modal(MUST))).toEqual({});
  });

  test('a frequency adverb goes before the modal', () => {
    expect(modalAdverbEn(modal(WILL, ALWAYS))).toEqual({ pre: 'always' });
    expect(modalAdverbEn(modal(CAN, NEVER))).toEqual({ pre: 'never' });
  });

  // A80: a manner adverb has no slot inside the chain; `predicateParts` trails it after the clause.
  test('a manner adverb places nothing inside the chain', () => {
    expect(modalAdverbEn(modal(WILL, SLOWLY))).toEqual({});
  });

  test('an adverb with no English base places nothing', () => {
    expect(modalAdverbEn(modal(MUST, { subtype: 'frequency' }))).toEqual({});
  });
});
