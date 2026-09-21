import { describe, expect, test } from 'vitest';
import { headPreposition } from './headPreposition.js';

describe('headPreposition', () => {
  test('a one-word head is the preposition itself', () => {
    expect(headPreposition('en')).toBe('en');
    expect(headPreposition('durch')).toBe('durch');
    expect(headPreposition('à travers')).toBe('travers');
  });

  test('a locution gives the preposition that actually governs what follows', () => {
    expect(headPreposition('debaixo de')).toBe('de');
    expect(headPreposition('intorno a')).toBe('a');
    expect(headPreposition('por encima de')).toBe('de');
    expect(headPreposition('em frente de')).toBe('de');
  });

  test('an empty head has no preposition — the German bare dative', () => {
    expect(headPreposition('')).toBe('');
  });
});
