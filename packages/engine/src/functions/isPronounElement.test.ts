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

  // P09-E40: an indefinite pronoun is a full phrase, known by its slot — a thing or a person alike.
  test('an indefinite pronoun is no personal pronoun', () => {
    expect(isPronounElement(el(np({ base: 'qualcosa', person: '3', thing: '1', indefinite: '1' })))).toBe(false);
    expect(isPronounElement(el(np({ base: 'qualcuno', person: '3', indefinite: '1' })))).toBe(false);
    // `thing` alone no longer decides it.
    expect(isPronounElement(el(np({ base: 'qualcosa', person: '3', thing: '1' })))).toBe(true);
  });

  test('a coordination of pronouns cannot be a clitic', () => {
    expect(isPronounElement(group('and', np(ME), np(YOU)))).toBe(false);
  });
});
