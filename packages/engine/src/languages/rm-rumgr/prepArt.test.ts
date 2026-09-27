import { describe, expect, test } from 'vitest';
import { AUA, CHASA, CHAUN, UM } from './rumgr.fixtures.js';
import { prepArt } from './prepArt.js';

describe('prepArt', () => {
  test('a and da contract with the masculine article: al, als, dal, dals', () => {
    expect(prepArt('a', CHAUN)).toBe('al');
    expect(prepArt('a', CHAUN, true)).toBe('als');
    expect(prepArt('da', CHAUN)).toBe('dal');
    expect(prepArt('da', CHAUN, true)).toBe('dals');
  });

  test('the feminine stays apart: a la, da las', () => {
    expect(prepArt('a', CHASA)).toBe('a la');
    expect(prepArt('da', CHASA, true)).toBe('da las');
  });

  test("before a vowel the elided article stays apart: a l', da l'", () => {
    expect(prepArt('a', UM)).toBe("a l'");
    expect(prepArt('da', AUA)).toBe("da l'");
    // …but the plural never elides, so it contracts: "dals umens".
    expect(prepArt('da', UM, true)).toBe('dals');
  });

  test('no other preposition contracts: en il, sin ils, cun la', () => {
    expect(prepArt('en', CHAUN)).toBe('en il');
    expect(prepArt('sin', CHAUN, true)).toBe('sin ils');
    expect(prepArt('cun', CHASA)).toBe('cun la');
  });

  test('the following word decides the elision', () => {
    expect(prepArt('a', UM, false, 'grond')).toBe('al');
  });
});
