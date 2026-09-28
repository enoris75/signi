import { describe, expect, test } from 'vitest';
import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { elementText } from './elementText.js';
import { cf } from './pl.fixtures.js';

const np = (id: string, extra: Record<string, string> = {}): ResolvedNounPhrase => ({ head: cf(id, { number: 'singular', ...extra }), adjectives: [], nounModifiers: [] });
const group = (conjunction: 'and' | 'or', ...conjuncts: ResolvedNounPhrase[]): ResolvedNounElement =>
  ({ conjuncts, conjunction, agreement: { person: '3', number: 'plural', gender: 'masc' } });

describe('elementText', () => {
  test('each conjunct takes the slot\'s case', () => {
    expect(elementText(group('and', np('CAT'), np('DOG')), 'acc')).toBe('kota i psa');
    expect(elementText(group('or', np('CAT'), np('MOUSE')), 'ins')).toBe('kotem lub myszą');
  });

  test('three conjuncts: commas, the word before the last', () => {
    expect(elementText(group('and', np('CAT'), np('DOG'), np('MOUSE')), 'nom')).toBe('kot, pies i mysz');
  });

  test('the correlative pair', () => {
    expect(elementText({ ...group('and', np('CAT'), np('DOG')), correlative: true }, 'nom')).toBe('zarówno kot, jak i pies');
  });

  test('a focus particle', () => {
    const one = np('CAT', { });
    expect(elementText({ conjuncts: [{ ...one, focus: 'only' }], agreement: one.head.forms }, 'nom')).toBe('tylko kot');
  });
});
