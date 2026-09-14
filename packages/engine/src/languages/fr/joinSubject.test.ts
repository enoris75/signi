import { describe, expect, test } from 'vitest';
import { joinSubject } from './joinSubject.js';

describe('joinSubject', () => {
  test('je elides before a vowel-initial predicate', () => {
    expect(joinSubject('je', 'ai mangé')).toBe("j'ai mangé");
    expect(joinSubject('je', 'étais en train de manger')).toBe("j'étais en train de manger");
  });

  test('je keeps its e before a consonant, a clitic or ne', () => {
    expect(joinSubject('je', 'mange')).toBe('je mange');
    expect(joinSubject('je', "l'aime")).toBe("je l'aime");
    expect(joinSubject('je', "n'aime pas")).toBe("je n'aime pas");
  });

  test('je elides before the clitic y', () => {
    expect(joinSubject('je', 'y suis')).toBe("j'y suis");
    expect(joinSubject('je', "n'y suis pas")).toBe("je n'y suis pas");
  });

  test('any other subject takes a space, and an empty side drops out', () => {
    expect(joinSubject('il', 'aime')).toBe('il aime');
    expect(joinSubject('moi et toi, nous', 'aimons')).toBe('moi et toi, nous aimons');
    expect(joinSubject('', 'aime')).toBe('aime');
    expect(joinSubject('je', '')).toBe('je');
  });
});
