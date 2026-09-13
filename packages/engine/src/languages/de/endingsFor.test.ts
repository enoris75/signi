import { describe, expect, test } from 'vitest';
import { MIXED_ENDINGS, STRONG_DAT, STRONG_ENDINGS, STRONG_GEN, WEAK_ENDINGS } from './de.consts.js';
import { endingsFor } from './endingsFor.js';

describe('endingsFor', () => {
  test('the definite article and the der-words take the weak endings', () => {
    for (const definiteness of ['definite', 'this', 'that', 'all']) {
      expect(endingsFor('nom', definiteness, false)).toBe(WEAK_ENDINGS.nom);
    }
    expect(endingsFor('acc', 'all', true)).toBe(WEAK_ENDINGS.acc);
  });

  test('the singular ein- and kein- take the mixed endings', () => {
    expect(endingsFor('nom', 'indefinite', false)).toBe(MIXED_ENDINGS.nom);
    expect(endingsFor('acc', 'no', false)).toBe(MIXED_ENDINGS.acc);
  });

  test('in the plural kein- declines weak and the article-less indefinite strong', () => {
    expect(endingsFor('nom', 'no', true)).toBe(WEAK_ENDINGS.nom); // keine großen Häuser
    expect(endingsFor('acc', 'indefinite', true)).toBe(STRONG_ENDINGS.acc); // große Häuser
  });

  test('a bare phrase and einige/viele/wenige take the strong endings', () => {
    expect(endingsFor('nom', 'bare', false)).toBe(STRONG_ENDINGS.nom);
    for (const definiteness of ['some', 'many', 'few']) {
      expect(endingsFor('acc', definiteness, true)).toBe(STRONG_ENDINGS.acc);
    }
  });

  test('the dative declines strong only when bare, else the invariant weak -en', () => {
    expect(endingsFor('dat', 'bare', false)).toBe(STRONG_DAT); // mit kaltem Wasser
    expect(endingsFor('dat', 'indefinite', false)).toBe(WEAK_ENDINGS.dat); // mit einem großen Haus
    expect(endingsFor('dat', 'no', true)).toBe(WEAK_ENDINGS.dat);
  });

  test('the genitive declines strong only with no article at all', () => {
    expect(endingsFor('gen', 'bare', false)).toBe(STRONG_GEN);
    expect(endingsFor('gen', 'some', true)).toBe(STRONG_GEN); // einiger großer Häuser
    expect(endingsFor('gen', 'indefinite', true)).toBe(STRONG_GEN); // großer Häuser
    expect(endingsFor('gen', 'indefinite', false)).toBe(WEAK_ENDINGS.gen); // eines großen Hauses
    expect(endingsFor('gen', 'all', true)).toBe(WEAK_ENDINGS.gen); // aller großen Häuser
  });
});
