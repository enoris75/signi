import { describe, expect, test } from 'vitest';
import { conjPn } from './conjPn.js';
import { ESSEN, GEHEN, MUESSEN, WAEHLEN } from './de.fixtures.js';

describe('conjPn', () => {
  test('picks the person-number form for the tense', () => {
    expect(conjPn(ESSEN, '3sg', 'present')).toBe('isst');
    expect(conjPn(ESSEN, '2pl', 'present')).toBe('esst');
    expect(conjPn(ESSEN, '1sg', 'past')).toBe('aß');
    expect(conjPn(MUESSEN, '3sg', 'past')).toBe('musste');
  });

  test('falls back to a tense-wide form when the person form is missing', () => {
    expect(conjPn({ base: 'müssen', past: 'musste' }, '1sg', 'past')).toBe('musste');
  });

  test('falls back to the present when the tense has no form', () => {
    // German readily uses the present for a future ("morgen geht er").
    expect(conjPn(GEHEN, '3sg', 'future')).toBe('geht');
  });

  test('falls back to the infinitive, which is also the 1pl/3pl present', () => {
    expect(conjPn(WAEHLEN, '3pl', 'present')).toBe('wählen');
  });

  test('is empty when there is no form at all', () => {
    expect(conjPn({}, '3sg', 'present')).toBe('');
  });
});
