import { describe, expect, test } from 'vitest';
import { CAT, HE, I, ONE, SHE, THEY, WE, YOU } from './en.fixtures.js';
import { objectPronounText } from './objectPronounText.js';

const YOU_ALL = { ...YOU, number: 'plural' };

describe('objectPronounText', () => {
  test('a 1st- or 2nd-person pronoun with the subject’s person and number is reflexive', () => {
    expect(objectPronounText(I, I)).toBe('myself');
    expect(objectPronounText(WE, WE)).toBe('ourselves');
    expect(objectPronounText(YOU, YOU)).toBe('yourself');
    expect(objectPronounText(YOU_ALL, YOU_ALL)).toBe('yourselves');
  });

  test('the subject is read as agreement, so a coordinated 1st-plural subject takes "ourselves"', () => {
    expect(objectPronounText(WE, { person: '1', number: 'plural', gender: 'masc' })).toBe('ourselves');
  });

  test('a differing person or number takes the plain object form', () => {
    expect(objectPronounText(WE, I)).toBe('us');
    expect(objectPronounText(I, WE)).toBe('me');
    expect(objectPronounText(YOU, I)).toBe('you');
    expect(objectPronounText(YOU_ALL, YOU)).toBe('you');
    expect(objectPronounText(I, CAT)).toBe('me');
    expect(objectPronounText(I, ONE)).toBe('me');
  });

  test('the 3rd person is never reflexive: "he sees him" is two people', () => {
    expect(objectPronounText(HE, HE)).toBe('him');
    expect(objectPronounText(SHE, SHE)).toBe('her');
    expect(objectPronounText(THEY, THEY)).toBe('them');
  });

  test('a pronoun with no reflexive seeded falls back to its object form', () => {
    const bare = Object.fromEntries(Object.entries(I).filter(([key]) => !key.startsWith('reflexive')));
    expect(objectPronounText(bare, I)).toBe('me');
  });
});
