import { describe, expect, test } from 'vitest';
import { coordinate } from './coordinate.js';
import { CANE, el, type Forms, GATTO, group, np, VOLPE } from './it.fixtures.js';
import type { ResolvedNounPhrase } from '../../types.js';

const ELEFANTE: Forms = { base: 'elefante', plural: 'elefanti', gender: 'masc', count: 'singular', animate: '1' };
const base = (phrase: ResolvedNounPhrase) => phrase.head.forms['base'] ?? '';

describe('coordinate', () => {
  test('a single conjunct renders on its own', () => {
    expect(coordinate(el(np(GATTO)), base)).toBe('gatto');
  });

  test('joins two conjuncts with e', () => {
    expect(coordinate(el(np(GATTO), np(CANE)), base)).toBe('gatto e cane');
  });

  test('puts commas between all but the last pair', () => {
    expect(coordinate(el(np(GATTO), np(CANE), np(VOLPE)), base)).toBe('gatto, cane e volpe');
  });

  test('joins with o for or', () => {
    expect(coordinate(group('or', np(GATTO), np(CANE), np(VOLPE)), base)).toBe('gatto, cane o volpe');
  });

  test('e becomes the euphonic ed before an e-, but o never changes', () => {
    expect(coordinate(el(np(GATTO), np(ELEFANTE)), base)).toBe('gatto ed elefante');
    expect(coordinate(group('or', np(GATTO), np(ELEFANTE)), base)).toBe('gatto o elefante');
  });

  test('drops a conjunct that renders empty', () => {
    const slot = el(np(GATTO), np(CANE), np(VOLPE));
    expect(coordinate(slot, (phrase) => (phrase.head.forms['base'] === 'cane' ? '' : base(phrase)))).toBe('gatto e volpe');
  });
});
