import { describe, expect, test } from 'vitest';
import { coordinate } from './coordinate.js';

describe('coordinate', () => {
  test('commas, then i before the last', () => {
    expect(coordinate(['gran', 'vell', 'bonic'])).toBe('gran, vell i bonic');
  });

  test('i never changes before an i- word', () => {
    expect(coordinate(['gran', 'intel·ligent'])).toBe('gran i intel·ligent');
  });
});
