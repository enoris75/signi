import { describe, expect, test } from 'vitest';
import { objectPrepCase } from './objectPrepCase.js';

describe('objectPrepCase', () => {
  test('a two-way or accusative preposition takes its object in the accusative', () => {
    expect(objectPrepCase('auf')).toBe('acc');
    expect(objectPrepCase('an')).toBe('acc');
    expect(objectPrepCase('für')).toBe('acc');
  });

  test('a dative-only preposition keeps the dative for an object too', () => {
    expect(objectPrepCase('von')).toBe('dat');
    expect(objectPrepCase('mit')).toBe('dat');
    expect(objectPrepCase('aus')).toBe('dat');
  });
});
