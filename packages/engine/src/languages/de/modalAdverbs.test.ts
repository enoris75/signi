import { describe, expect, test } from 'vitest';
import { IMMER, KOENNEN, modal, MUESSEN, NIE, WOLLEN } from './de.fixtures.js';
import { modalAdverbs } from './modalAdverbs.js';

describe('modalAdverbs', () => {
  test('is empty when no modal carries an adverb', () => {
    expect(modalAdverbs([modal(WOLLEN), modal(KOENNEN)])).toBe('');
    expect(modalAdverbs([])).toBe('');
  });

  test('keeps the adverbs in scope order, outermost modal first', () => {
    // "er will nie immer gehen können": never wants to always be able to go.
    expect(modalAdverbs([modal(WOLLEN, NIE), modal(KOENNEN, IMMER)])).toBe('nie immer');
  });

  test('skips the modals without one', () => {
    expect(modalAdverbs([modal(WOLLEN), modal(MUESSEN, IMMER), modal(KOENNEN)])).toBe('immer');
  });
});
