import { describe, expect, test } from 'vitest';
import { joinSubject } from './joinSubject.js';

/** A verb on a consonant, whose lexeme says nothing about elision. */
const V = { base: 'manger' };

describe('joinSubject', () => {
  test('je elides before a vowel-initial predicate', () => {
    expect(joinSubject('je', 'ai mangé', V)).toBe("j'ai mangé");
    expect(joinSubject('je', 'étais en train de manger', V)).toBe("j'étais en train de manger");
  });

  test('je keeps its e before a consonant, a clitic or ne', () => {
    expect(joinSubject('je', 'mange', V)).toBe('je mange');
    expect(joinSubject('je', "l'aime", V)).toBe("je l'aime");
    expect(joinSubject('je', "n'aime pas", V)).toBe("je n'aime pas");
  });

  // A227: an h muet is a vowel sound, and the verb's lexeme says which h is one.
  test('je elides before a verb on an h muet, not on an h aspiré', () => {
    expect(joinSubject('je', 'habite', { base: 'habiter', elides: '1' })).toBe("j'habite");
    expect(joinSubject('je', 'habitais', { base: 'habiter', elides: '1' })).toBe("j'habitais");
    expect(joinSubject('je', 'hurle', { base: 'hurler' })).toBe('je hurle');
    expect(joinSubject('je', "n'habite pas", { base: 'habiter', elides: '1' })).toBe("je n'habite pas");
  });

  test('je elides before the clitic y', () => {
    expect(joinSubject('je', 'y suis', V)).toBe("j'y suis");
    expect(joinSubject('je', "n'y suis pas", V)).toBe("je n'y suis pas");
  });

  test('any other subject takes a space, and an empty side drops out', () => {
    expect(joinSubject('il', 'aime', V)).toBe('il aime');
    expect(joinSubject('moi et toi, nous', 'aimons', V)).toBe('moi et toi, nous aimons');
    expect(joinSubject('', 'aime', V)).toBe('aime');
    expect(joinSubject('je', '', V)).toBe('je');
  });
});
