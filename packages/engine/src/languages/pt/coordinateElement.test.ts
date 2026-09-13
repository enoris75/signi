import { describe, expect, test } from 'vitest';
import { coordinateElement } from './coordinateElement.js';
import { npText } from './npText.js';
import { CAO, CASA, el, GATO, group, np, RAPOSA } from './pt.fixtures.js';

describe('coordinateElement', () => {
  test('a single conjunct renders on its own', () => {
    expect(coordinateElement(el(np(GATO)), npText)).toBe('o gato');
  });

  test('"e" joins the last pair, commas the rest', () => {
    expect(coordinateElement(el(np(GATO), np(CAO)), npText)).toBe('o gato e o cão');
    expect(coordinateElement(el(np(GATO), np(CAO), np(RAPOSA)), npText)).toBe('o gato, o cão e a raposa');
  });

  test('"ou" for a disjunction', () => {
    expect(coordinateElement(group('or', np(GATO), np(CASA, { definiteness: 'indefinite' })), npText)).toBe('o gato ou uma casa');
    expect(coordinateElement(group('or', np(GATO), np(CAO), np(RAPOSA)), npText)).toBe('o gato, o cão ou a raposa');
  });

  test('renders every conjunct with the given renderer', () => {
    expect(coordinateElement(el(np(GATO), np(RAPOSA)), (conjunct) => conjunct.head.forms['base'] ?? '')).toBe('gato e raposa');
  });
});
