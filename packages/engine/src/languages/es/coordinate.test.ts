import { describe, expect, test } from 'vitest';
import { coordinate } from './coordinate.js';

describe('coordinate', () => {
  test('a single adjective stands on its own', () => {
    expect(coordinate(['grande'])).toBe('grande');
    expect(coordinate([])).toBe('');
  });

  test('joins two adjectives with y', () => {
    expect(coordinate(['grande', 'viejo'])).toBe('grande y viejo');
  });

  test('puts commas between all but the last pair', () => {
    expect(coordinate(['grande', 'viejo', 'hermoso'])).toBe('grande, viejo y hermoso');
  });

  test('y becomes e before an i- or hi- sound', () => {
    expect(coordinate(['frío', 'interesante'])).toBe('frío e interesante');
    expect(coordinate(['fuerte', 'hiriente'])).toBe('fuerte e hiriente');
  });

  test('y stays before the diphthong hie-', () => {
    expect(coordinate(['frío', 'hierático'])).toBe('frío y hierático');
  });

  test('only the word after the conjunction decides between y and e', () => {
    expect(coordinate(['interesante', 'viejo', 'hermoso'])).toBe('interesante, viejo y hermoso');
  });

  test('drops an empty adjective', () => {
    expect(coordinate(['grande', '', 'viejo'])).toBe('grande y viejo');
  });
});
