import { describe, expect, test } from 'vitest';
import { nounAgr } from './nounAgr.js';
import { CHLOPIEC, COS, DOM, JA, KOT, MEZCZYZNA, PIENIADZE } from './pl.fixtures.js';

describe('nounAgr', () => {
  test('an animal is animate and never virile', () => {
    expect(nounAgr({ ...KOT, number: 'plural' })).toEqual({ gender: 'masc', plural: true, virile: false, animate: true });
  });

  test('a masculine personal plural is virile', () => {
    expect(nounAgr({ ...CHLOPIEC, number: 'plural' }).virile).toBe(true);
  });

  test('mężczyzna has no animate_acc of its own, but its adjective agrees as animate', () => {
    expect(nounAgr(MEZCZYZNA).animate).toBe(true);
  });

  test('an inanimate masculine is not animate', () => {
    expect(nounAgr(DOM).animate).toBe(false);
  });

  test('a plurale tantum agrees as a non-virile plural', () => {
    expect(nounAgr({ ...PIENIADZE, number: 'singular' })).toEqual({ gender: 'masc', plural: true, virile: false, animate: false });
  });

  test('the feminine variant agrees as a feminine', () => {
    expect(nounAgr({ ...KOT, gender: 'fem' }).gender).toBe('fem');
  });

  test('a masculine plural personal pronoun is virile; a thing is not', () => {
    expect(nounAgr({ ...JA, number: 'plural' }).virile).toBe(true);
    expect(nounAgr(COS).animate).toBe(false);
  });
});
