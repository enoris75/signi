import { describe, expect, test } from 'vitest';
import { estCeQue } from './estCeQue.js';

describe('estCeQue', () => {
  test('puts "est-ce que" before the statement, unchanged', () => {
    expect(estCeQue('le chat mange')).toBe('est-ce que le chat mange');
    expect(estCeQue('je mange')).toBe('est-ce que je mange');
    expect(estCeQue('le chat ne mange pas')).toBe('est-ce que le chat ne mange pas');
  });

  test('elides "que" before a vowel', () => {
    expect(estCeQue('il mange')).toBe("est-ce qu'il mange");
    expect(estCeQue('elle est prudente')).toBe("est-ce qu'elle est prudente");
    expect(estCeQue('un chat mange')).toBe("est-ce qu'un chat mange");
  });

  test('an elided article leads with a consonant, so "que" stays whole', () => {
    expect(estCeQue("l'homme mange")).toBe("est-ce que l'homme mange");
  });
});
