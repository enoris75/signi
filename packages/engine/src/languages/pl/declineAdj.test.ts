import { describe, expect, test } from 'vitest';
import { declineAdj } from './declineAdj.js';
import type { Agr } from './pl.types.js';

const M: Agr = { gender: 'masc', plural: false, virile: false, animate: false };
const MA: Agr = { ...M, animate: true };
const F: Agr = { ...M, gender: 'fem' };
const N: Agr = { ...M, gender: 'neut' };
const VIR: Agr = { gender: 'masc', plural: true, virile: true, animate: true };
const PL: Agr = { gender: 'fem', plural: true, virile: false, animate: false };

describe('declineAdj', () => {
  test('a hard -y stem, every singular column', () => {
    expect(['nom', 'gen', 'dat', 'acc', 'ins', 'loc'].map((c) => declineAdj('dobry', 'dobrzy', c as never, M)))
      .toEqual(['dobry', 'dobrego', 'dobremu', 'dobry', 'dobrym', 'dobrym']);
    expect(['nom', 'gen', 'dat', 'acc', 'ins', 'loc'].map((c) => declineAdj('dobry', 'dobrzy', c as never, F)))
      .toEqual(['dobra', 'dobrej', 'dobrej', 'dobrą', 'dobrą', 'dobrej']);
    expect(declineAdj('dobry', 'dobrzy', 'nom', N)).toBe('dobre');
  });

  test('the masculine animate accusative is the genitive', () => {
    expect(declineAdj('duży', 'duzi', 'acc', MA)).toBe('dużego');
  });

  test('the plurals: the stored virile, the virile accusative = genitive', () => {
    expect(declineAdj('dobry', 'dobrzy', 'nom', VIR)).toBe('dobrzy');
    expect(declineAdj('dobry', 'dobrzy', 'acc', VIR)).toBe('dobrych');
    expect(declineAdj('dobry', 'dobrzy', 'acc', PL)).toBe('dobre');
    expect(declineAdj('dobry', 'dobrzy', 'ins', PL)).toBe('dobrymi');
  });

  test('a -ki stem writes i and ie', () => {
    expect(declineAdj('wysoki', 'wysocy', 'nom', N)).toBe('wysokie');
    expect(declineAdj('wysoki', 'wysocy', 'gen', M)).toBe('wysokiego');
    expect(declineAdj('wysoki', 'wysocy', 'nom', F)).toBe('wysoka');
    expect(declineAdj('wysoki', 'wysocy', 'loc', PL)).toBe('wysokich');
  });

  test('a soft stem keeps its i', () => {
    expect(declineAdj('ostatni', 'ostatni', 'nom', F)).toBe('ostatnia');
    expect(declineAdj('ostatni', 'ostatni', 'gen', M)).toBe('ostatniego');
    expect(declineAdj('ostatni', 'ostatni', 'ins', M)).toBe('ostatnim');
    expect(declineAdj('ostatni', 'ostatni', 'ins', PL)).toBe('ostatnimi');
  });

  test('the vocative is the nominative', () => {
    expect(declineAdj('mały', 'mali', 'voc', F)).toBe('mała');
  });

  test('a base in neither -y nor -i stands as it is', () => {
    expect(declineAdj('groß', undefined, 'gen', F)).toBe('groß');
  });
});
