import { describe, expect, test } from 'vitest';
import { ACQUA, GATTO } from '../translator.fixtures.js';
import { applyPluralOnly } from './applyPluralOnly.js';

describe('applyPluralOnly', () => {
  test('a plural-only lexeme takes its base as the plural and sheds the mass flag', () => {
    const forms = { base: 'notizie', gender: 'fem', count: 'plural', uncountable: '1' };
    expect(applyPluralOnly(forms)).toBe(true);
    expect(forms).toEqual({ base: 'notizie', plural: 'notizie', gender: 'fem', count: 'plural' });
  });

  test('a plural it seeds of its own is kept', () => {
    const forms = { base: 'Nachrichten', plural: 'Nachrichten', count: 'plural' };
    expect(applyPluralOnly(forms)).toBe(true);
    expect(forms['plural']).toBe('Nachrichten');
  });

  test('a singular or mass lexeme is left alone', () => {
    for (const lexeme of [{ ...GATTO, count: 'singular' }, { ...ACQUA }]) {
      const forms = { ...lexeme };
      expect(applyPluralOnly(forms)).toBe(false);
      expect(forms).toEqual(lexeme);
    }
  });
});
