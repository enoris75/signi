import { describe, expect, test } from 'vitest';
import { KOENNEN, modal, MUESSEN, WOLLEN } from './de.fixtures.js';
import { modalStack } from './modalStack.js';

describe('modalStack', () => {
  test('a lone finite modal leaves nothing to stack', () => {
    // "er muss gehen": muss is in V2, so the clause end holds only the main verb.
    expect(modalStack([modal(MUESSEN)], false)).toEqual([]);
  });

  test('stacks the outermost modal too when werden/würde holds V2', () => {
    // "er wird gehen müssen"
    expect(modalStack([modal(MUESSEN)], true)).toEqual(['müssen']);
  });

  test('stacks a chain in mirror order, innermost first', () => {
    const chain = [modal(WOLLEN), modal(MUESSEN), modal(KOENNEN)];
    // "er will gehen können müssen"
    expect(modalStack(chain, false)).toEqual(['können', 'müssen']);
    // "er wird gehen können müssen wollen"
    expect(modalStack(chain, true)).toEqual(['können', 'müssen', 'wollen']);
  });

  test('an empty chain stacks nothing', () => {
    expect(modalStack([], true)).toEqual([]);
  });
});
