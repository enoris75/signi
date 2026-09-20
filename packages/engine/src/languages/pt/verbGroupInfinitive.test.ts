import { describe, expect, test } from 'vitest';
import { COMER, EU, GATO, IR, TORNAR_SE, VER } from './pt.fixtures.js';
import { verbGroupInfinitive } from './verbGroupInfinitive.js';

describe('verbGroupInfinitive', () => {
  test('the neutral aspect is the bare infinitive', () => {
    expect(verbGroupInfinitive(COMER, GATO, 'neutral')).toBe('comer');
  });

  test('the marked aspects put their auxiliary in the infinitive', () => {
    expect(verbGroupInfinitive(COMER, GATO, 'progressive')).toBe('estar comendo');
    expect(verbGroupInfinitive(IR, GATO, 'prospective')).toBe('estar prestes a ir');
    expect(verbGroupInfinitive(VER, GATO, 'resultative')).toBe('ter visto');
  });

  // A151: a reflexive verb's clitic agrees with the subject, and "ter" carries it in the perfect,
  // where the particípio has none.
  test('a reflexive verb agrees its clitic, on the infinitive, the gerund or "ter"', () => {
    expect(verbGroupInfinitive(TORNAR_SE, GATO, 'neutral')).toBe('tornar-se');
    expect(verbGroupInfinitive(TORNAR_SE, EU, 'neutral')).toBe('tornar-me');
    expect(verbGroupInfinitive(TORNAR_SE, EU, 'progressive')).toBe('estar tornando-me');
    expect(verbGroupInfinitive(TORNAR_SE, EU, 'prospective')).toBe('estar prestes a tornar-me');
    expect(verbGroupInfinitive(TORNAR_SE, GATO, 'resultative')).toBe('ter-se tornado');
    expect(verbGroupInfinitive(TORNAR_SE, EU, 'resultative')).toBe('ter-me tornado');
  });
});
