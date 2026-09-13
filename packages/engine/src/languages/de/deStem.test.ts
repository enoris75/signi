import { describe, expect, test } from 'vitest';
import { ALT, concept, GROSS, KLEIN } from './de.fixtures.js';
import { deStem } from './deStem.js';

describe('deStem', () => {
  test('umlauts the base of a lexeme flagged for it', () => {
    expect(deStem(concept(ALT), 'alt')).toBe('ält');
    expect(deStem(concept(GROSS), 'groß')).toBe('größ');
  });

  test('leaves an unflagged base alone, even when its vowel could umlaut', () => {
    expect(deStem(concept(KLEIN), 'klein')).toBe('klein');
    // Umlaut under comparison is lexical: braun → brauner, not *bräuner.
    expect(deStem(concept({ role: 'adjective', base: 'braun' }), 'braun')).toBe('braun');
  });
});
