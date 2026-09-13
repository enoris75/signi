import { describe, expect, test } from 'vitest';
import { BUCH, el, group, HAUS, KATER, KATZE, np } from './de.fixtures.js';
import { coordinate } from './coordinate.js';

describe('coordinate', () => {
  test('a single conjunct renders on its own', () => {
    expect(coordinate(el(np(KATER)), (phrase) => phrase.head.forms['base'] ?? '')).toBe('Kater');
  });

  test('joins two conjuncts with und', () => {
    expect(coordinate(el(np(KATER), np(KATZE)), (phrase) => phrase.head.forms['base'] ?? '')).toBe('Kater und Katze');
  });

  test('puts commas between all but the last pair', () => {
    const slot = el(np(KATER), np(KATZE), np(BUCH));
    expect(coordinate(slot, (phrase) => phrase.head.forms['base'] ?? '')).toBe('Kater, Katze und Buch');
  });

  test('joins with oder for or', () => {
    const slot = group('or', np(BUCH), np(HAUS), np(KATER));
    expect(coordinate(slot, (phrase) => phrase.head.forms['base'] ?? '')).toBe('Buch, Haus oder Kater');
  });

  test('drops a conjunct that renders empty', () => {
    const slot = el(np(KATER), np(KATZE), np(BUCH));
    expect(coordinate(slot, (phrase) => (phrase.head.forms['base'] === 'Katze' ? '' : phrase.head.forms['base'] ?? ''))).toBe('Kater und Buch');
  });
});
