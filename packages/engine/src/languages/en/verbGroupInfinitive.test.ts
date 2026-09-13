import { describe, expect, test } from 'vitest';
import { BE, EAT, GO, SEE } from './en.fixtures.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

describe('verbGroupInfinitive', () => {
  test('the neutral aspect is the bare base', () => {
    expect(verbGroupInfinitive(EAT, 'neutral')).toBe('eat');
  });

  test('progressive: be + the gerund', () => {
    expect(verbGroupInfinitive(EAT, 'progressive')).toBe('be eating');
  });

  test('prospective: be about to + the base', () => {
    expect(verbGroupInfinitive(GO, 'prospective')).toBe('be about to go');
  });

  test('resultative: have + the participle, or be on a verb whose perfect selects it', () => {
    expect(verbGroupInfinitive(SEE, 'resultative')).toBe('have seen');
    expect(verbGroupInfinitive(BE, 'resultative')).toBe('have been');
    expect(verbGroupInfinitive(GO, 'resultative')).toBe('be gone');
  });
});
