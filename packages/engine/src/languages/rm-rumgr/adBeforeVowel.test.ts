import { describe, expect, test } from 'vitest';
import { adBeforeVowel } from './adBeforeVowel.js';

describe('adBeforeVowel', () => {
  test('a is ad before a vowel: ad esser, ad in um, ad el', () => {
    expect(adBeforeVowel('a', 'esser')).toBe('ad');
    expect(adBeforeVowel('a', 'in')).toBe('ad');
    expect(adBeforeVowel('a', 'el')).toBe('ad');
    expect(adBeforeVowel('a', 'ir')).toBe('ad');
  });

  test('a stays a before a consonant, the elided article included', () => {
    expect(adBeforeVowel('a', 'mangiar')).toBe('a');
    expect(adBeforeVowel('a', 'la')).toBe('a');
    expect(adBeforeVowel('a', "l'um")).toBe('a');
    expect(adBeforeVowel('a', '')).toBe('a');
  });

  test('every other preposition is unchanged', () => {
    expect(adBeforeVowel('da', 'in')).toBe('da');
    expect(adBeforeVowel('cun', 'el')).toBe('cun');
  });
});
