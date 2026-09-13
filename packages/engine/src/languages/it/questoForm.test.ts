import { describe, expect, test } from 'vitest';
import { ALA, CASA, GATTO, SLOT, UOMO } from './it.fixtures.js';
import { questoForm } from './questoForm.js';

describe('questoForm', () => {
  test('agrees in gender and number', () => {
    expect(questoForm(GATTO, false, 'gatto')).toBe('questo');
    expect(questoForm(CASA, false, 'casa')).toBe('questa');
    expect(questoForm(GATTO, true, 'gatti')).toBe('questi');
    expect(questoForm(CASA, true, 'case')).toBe('queste');
  });

  test('the singular elides before a vowel', () => {
    expect(questoForm(UOMO, false, 'uomo')).toBe("quest'");
    expect(questoForm(ALA, false, 'ala')).toBe("quest'");
  });

  test('the plural never elides', () => {
    expect(questoForm(UOMO, true, 'uomini')).toBe('questi');
    expect(questoForm(ALA, true, 'ali')).toBe('queste');
  });

  test('s + consonant takes the plain form', () => {
    expect(questoForm(SLOT, false, 'slot')).toBe('questo');
  });
});
