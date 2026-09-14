import { describe, expect, test } from 'vitest';
import { postnominal } from './postnominal.js';

describe('postnominal', () => {
  test('the fixed words after the head, space-led', () => {
    expect(postnominal({ base: 'Bestimmung', postnominal: 'des Ortes' })).toBe(' des Ortes');
  });

  test('nothing for a plain noun', () => {
    expect(postnominal({ base: 'Katze' })).toBe('');
  });
});
