import { describe, expect, test } from 'vitest';
import { GATTO, LOOKUP } from '../translator.fixtures.js';
import { resolve } from './resolve.js';

describe('resolve', () => {
  test("copies the lexicon entry's forms under the concept id", () => {
    expect(resolve('CAT', 'it', LOOKUP)).toEqual({ conceptId: 'CAT', forms: GATTO });
  });

  test('asks the lookup for the concept in the language', () => {
    const asked: string[] = [];
    resolve('CAT', 'fr', (conceptId, language) => {
      asked.push(`${conceptId}/${language}`);
      return undefined;
    });
    expect(asked).toEqual(['CAT/fr']);
  });

  test('the forms are a copy the caller may change, leaving the lexicon entry untouched', () => {
    resolve('CAT', 'it', LOOKUP).forms['base'] = 'gatta';
    expect(resolve('CAT', 'it', LOOKUP).forms['base']).toBe('gatto');
  });

  test('a concept the language has no entry for resolves with no forms', () => {
    expect(resolve('UNICORN', 'it', LOOKUP)).toEqual({ conceptId: 'UNICORN', forms: {} });
  });
});
