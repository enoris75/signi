import { describe, expect, test } from 'vitest';
import { adj, BUCH, DU, el, ER, group, ICH, JUNGE, KATER, KATZE, KLEIN, MESSER, np } from './de.fixtures.js';
import { elementPhrase } from './elementPhrase.js';

describe('elementPhrase', () => {
  test('a single noun phrase in the given case', () => {
    expect(elementPhrase(el(np(KATER, {}, { adjectives: [adj(KLEIN)] })), 'acc')).toBe('den kleinen Kater');
    expect(elementPhrase(el(np(MESSER)), 'dat')).toBe('dem Messer');
    expect(elementPhrase(el(np(KATZE)), 'nom')).toBe('die Katze');
  });

  test('every conjunct declines on its own, the article repeating', () => {
    expect(elementPhrase(el(np(MESSER), np(BUCH)), 'dat')).toBe('dem Messer und dem Buch');
    expect(elementPhrase(el(np(KATER), np(KATZE), np(JUNGE)), 'acc')).toBe('den Kater, die Katze und den Jungen');
  });

  test('an "or" group joins with oder', () => {
    expect(elementPhrase(group('or', np(KATER), np(KATZE)), 'acc')).toBe('den Kater oder die Katze');
  });

  test('a pronoun object takes its accusative form, no article', () => {
    expect(elementPhrase(el(np(ER)), 'acc')).toBe('ihn');
    expect(elementPhrase(el(np(ER, { gender: 'fem' })), 'acc')).toBe('sie');
    expect(elementPhrase(el(np(ICH)), 'acc')).toBe('mich');
    expect(elementPhrase(el(np(DU, { number: 'plural' })), 'acc')).toBe('euch');
  });

  test('a coordinated object picks the pronoun or the noun form per conjunct', () => {
    expect(elementPhrase(el(np(ER), np(ICH)), 'acc')).toBe('ihn und mich');
    expect(elementPhrase(el(np(KATER), np(DU)), 'acc')).toBe('den Kater und dich');
    expect(elementPhrase(group('or', np(ICH), np(KATZE)), 'acc')).toBe('mich oder die Katze');
  });
});
