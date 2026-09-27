import { describe, expect, test } from 'vitest';
import { EL, ELS, GIAT, INS, JAU, MANGIAR, NUS, SA_TSCHENTAR, TI, VUS } from './rumgr.fixtures.js';
import { reflexiveClitic, withClitic } from './reflexiveClitic.js';

describe('reflexiveClitic', () => {
  test('ma, ta, sa, ans, as, sa by the subject', () => {
    expect(reflexiveClitic(SA_TSCHENTAR, JAU)).toBe('ma');
    expect(reflexiveClitic(SA_TSCHENTAR, TI)).toBe('ta');
    expect(reflexiveClitic(SA_TSCHENTAR, EL)).toBe('sa');
    expect(reflexiveClitic(SA_TSCHENTAR, NUS)).toBe('ans');
    expect(reflexiveClitic(SA_TSCHENTAR, VUS)).toBe('as');
    expect(reflexiveClitic(SA_TSCHENTAR, ELS)).toBe('sa');
  });

  test('a noun and the generic ins take sa', () => {
    expect(reflexiveClitic(SA_TSCHENTAR, GIAT)).toBe('sa');
    expect(reflexiveClitic(SA_TSCHENTAR, INS)).toBe('sa');
  });

  test('nothing for a verb that is not reflexive', () => {
    expect(reflexiveClitic(MANGIAR, JAU)).toBe('');
  });
});

describe('withClitic', () => {
  test('before a consonant, apart', () => {
    expect(withClitic('ma', 'tschent')).toBe('ma tschent');
    expect(withClitic('ans', 'tschentain')).toBe('ans tschentain');
  });

  test("ma, ta, sa elide before a vowel; ans and as never do", () => {
    expect(withClitic('sa', 'avrir')).toBe("s'avrir");
    expect(withClitic('ma', 'avr')).toBe("m'avr");
    expect(withClitic('ta', 'è')).toBe("t'è");
    expect(withClitic('ans', 'avrin')).toBe('ans avrin');
    expect(withClitic('as', 'avris')).toBe('as avris');
  });

  test('an empty side leaves the other', () => {
    expect(withClitic('', 'tschenta')).toBe('tschenta');
    expect(withClitic('sa', '')).toBe('sa');
  });
});
