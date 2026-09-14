import { describe, expect, test } from 'vitest';
import { el, group, np } from '../languages/resolved.fixtures.js';
import { isPronounElement } from './isPronounElement.js';

const ME = { person: '1', number: 'singular', base: 'I', object: 'me' };
const YOU = { person: '2', number: 'singular', base: 'you', object: 'you' };
const CAT = { base: 'cat' };

describe('isPronounElement', () => {
  // A32: a lone pronoun object takes the pronoun path — oblique form, Romance clitic.
  test('a single pronoun', () => {
    expect(isPronounElement(el(np(ME)))).toBe(true);
  });

  test('a single noun', () => {
    expect(isPronounElement(el(np(CAT)))).toBe(false);
  });

  test('a coordination of pronouns cannot be a clitic', () => {
    expect(isPronounElement(group('and', np(ME), np(YOU)))).toBe(false);
  });
});
