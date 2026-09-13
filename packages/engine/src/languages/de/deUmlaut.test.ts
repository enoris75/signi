import { describe, expect, test } from 'vitest';
import { deUmlaut } from './deUmlaut.js';

describe('deUmlaut', () => {
  test('umlauts a, o and u', () => {
    expect(deUmlaut('alt')).toBe('ält');
    expect(deUmlaut('groß')).toBe('größ');
    expect(deUmlaut('jung')).toBe('jüng');
  });

  test('umlauts the diphthong au as a whole', () => {
    expect(deUmlaut('Haus')).toBe('Häus');
  });

  test('mutates only the last stem vowel', () => {
    expect(deUmlaut('Ausgang')).toBe('Ausgäng');
  });

  test('leaves a stem whose last vowel is not a, o or u untouched', () => {
    expect(deUmlaut('klein')).toBe('klein');
    expect(deUmlaut('müde')).toBe('müde');
    expect(deUmlaut('dunkel')).toBe('dunkel');
  });
});
