import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement, ResolvedNounPhrase } from '../types.js';
import { slotFocus } from './slotFocus.js';

const phrase = (focus?: ResolvedNounPhrase['focus']): ResolvedNounPhrase =>
  ({ head: { conceptId: 'CAT', forms: { base: 'cat' } }, adjectives: [], nounModifiers: [], focus });
const element = (...conjuncts: ResolvedNounPhrase[]): ResolvedNounElement => ({ conjuncts, agreement: {} });

describe('slotFocus', () => {
  test('a single phrase gives its own', () => {
    expect(slotFocus(element(phrase('only')))).toBe('only');
    expect(slotFocus(element(phrase()))).toBeUndefined();
  });

  test('a coordination has none, whatever its conjuncts say', () => {
    expect(slotFocus(element(phrase('even'), phrase()))).toBeUndefined();
    expect(slotFocus(element(phrase('even'), phrase('even')))).toBeUndefined();
  });

  test('an empty slot has none', () => {
    expect(slotFocus(undefined)).toBeUndefined();
  });
});
