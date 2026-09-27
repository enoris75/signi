import { describe, expect, test } from 'vitest';
import { naginForm } from './naginForm.js';

describe('naginForm', () => {
  test('agrees in gender, singular by default: nagin, nagina', () => {
    expect(naginForm('masc')).toBe('nagin');
    expect(naginForm('fem')).toBe('nagina');
  });

  test('a plurale tantum takes the plural: nagins, naginas', () => {
    expect(naginForm('masc', true)).toBe('nagins');
    expect(naginForm('fem', true)).toBe('naginas');
  });

  test('anything but fem is the masculine', () => {
    expect(naginForm('')).toBe('nagin');
  });
});
