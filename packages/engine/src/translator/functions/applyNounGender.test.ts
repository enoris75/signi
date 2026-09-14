import { describe, expect, test } from 'vitest';
import { CANE, GATTO } from '../translator.fixtures.js';
import { applyNounGender } from './applyNounGender.js';

describe('applyNounGender', () => {
  test('a feminine singular takes the feminine form', () => {
    const forms = { ...GATTO, number: 'singular' };
    applyNounGender(forms, 'fem');
    expect(forms).toEqual({ ...GATTO, number: 'singular', base: 'gatta', gender: 'fem' });
  });

  test('a feminine plural takes the feminine plural for both surfaces', () => {
    const forms = { ...GATTO, number: 'plural' };
    applyNounGender(forms, 'fem');
    expect(forms).toEqual({ ...GATTO, number: 'plural', base: 'gatte', plural: 'gatte', gender: 'fem' });
  });

  test('a lexeme missing its feminine plural falls back to the feminine singular, keeping the plural', () => {
    const forms = { base: 'gatto', plural: 'gatti', fem: 'gatta', number: 'plural' };
    applyNounGender(forms, 'fem');
    expect(forms).toEqual({ base: 'gatta', plural: 'gatti', fem: 'gatta', number: 'plural', gender: 'fem' });
  });

  test('a masculine or unchosen gender leaves the forms alone', () => {
    for (const gender of [undefined, 'masc'] as const) {
      const forms = { ...GATTO };
      applyNounGender(forms, gender);
      expect(forms).toEqual(GATTO);
    }
  });

  test('a noun with no feminine form stays as it is', () => {
    const forms = { ...CANE };
    applyNounGender(forms, 'fem');
    expect(forms).toEqual(CANE);
  });
});
