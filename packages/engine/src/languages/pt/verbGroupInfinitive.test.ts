import { describe, expect, test } from 'vitest';
import { COMER, IR, VER } from './pt.fixtures.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

describe('verbGroupInfinitive', () => {
  test('the neutral aspect is the bare infinitive', () => {
    expect(verbGroupInfinitive(COMER, 'neutral')).toBe('comer');
  });

  test('the marked aspects put their auxiliary in the infinitive', () => {
    expect(verbGroupInfinitive(COMER, 'progressive')).toBe('estar comendo');
    expect(verbGroupInfinitive(IR, 'prospective')).toBe('estar prestes a ir');
    expect(verbGroupInfinitive(VER, 'resultative')).toBe('ter visto');
  });
});
