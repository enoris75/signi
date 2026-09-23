import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, PronominalPossessor } from '@signi/shared';
import { clause, furigana, np, say, sayAll } from './harness.js';

// P11-E5: Japanese says how many siblings there are with a compound — 三人兄弟, no の — where every
// other counted phrase links its count with の (二匹の猫) or is its own counter (二十四時間). The
// lexeme's `counter_join` picks the shape: absent (の), 'head' (the time words) or 'compound' (兄弟,
// 姉妹). The other six count relatives with a plain cardinal and change nothing.

const of = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number });
const weAre = (phrase: NounPhrase): PhrasePlan => ({
  subject: np('FIRST_PERSON', { number: 'plural' }),
  verbPhrase: { verb: 'BE' },
  complements: { predicative: { phrase } },
});
const runs = (subject: NounPhrase) => say(clause(subject, 'RUN'), 'ja');

describe('we are three siblings', () => {
  test('the table', () => {
    expect(sayAll(weAre(np('SIBLING', { numeral: 3, definiteness: 'indefinite' })))).toEqual({
      en: 'we are three siblings.', it: 'siamo tre fratelli.', fr: 'nous sommes trois frères et sœurs.',
      de: 'wir sind drei Geschwister.', es: 'somos tres hermanos.', ja: '私たちは三人兄弟です。', pt: 'somos três irmãos.',
    });
  });
  test('as a subject', () => {
    expect(runs(np('SIBLING', { numeral: 3 }))).toBe('三人兄弟は走ります。');
  });
  test('the other words that compound: brothers and sisters', () => {
    expect(say(weAre(np('BROTHER', { numeral: 3, definiteness: 'indefinite' })), 'ja')).toBe('私たちは三人兄弟です。');
    expect(say(weAre(np('SISTER', { numeral: 3, definiteness: 'indefinite' })), 'ja')).toBe('私たちは三人姉妹です。');
  });
  test('no furigana over the count, and the head keeps its own (D3)', () => {
    expect(furigana(weAre(np('SIBLING', { numeral: 3, definiteness: 'indefinite' })))).toEqual(['わたしたち', 'きょうだい']);
  });
});

describe('where the の stays', () => {
  test('a head that became another word: an adjective fused in, or someone else\'s honorific', () => {
    expect(runs(np('BROTHER', { numeral: 3, adjectives: ['ELDER'] }))).toBe('三人の兄は走ります。');
    expect(runs(np('SIBLING', { numeral: 3, possessor: of('2') }))).toBe('あなたの三人のご兄弟は走ります。');
  });
  test('an adjective between the count and the head', () => {
    expect(runs(np('SIBLING', { numeral: 3, adjectives: ['BIG'] }))).toBe('三人の大きい兄弟は走ります。');
  });
  test('one\'s own siblings are the plain word, so they compound', () => {
    expect(runs(np('SIBLING', { numeral: 3, possessor: of('1') }))).toBe('三人兄弟は走ります。');
  });
  test('a relative that does not compound: 三人いとこ is not Japanese', () => {
    expect(runs(np('COUSIN', { numeral: 3 }))).toBe('三人のいとこは走ります。');
    // 三人家族 is a family *of* three, not three families.
    expect(runs(np('FAMILY', { numeral: 3 }))).toBe('三つの家族は走ります。');
  });
});

describe('the two shapes counter_join already had are unchanged', () => {
  test('the default links with の, and a time word is its own counter', () => {
    expect(runs(np('CAT', { numeral: 2 }))).toBe('二匹の猫は走ります。');
    expect(say({ subject: np('HOUR', { numeral: 24, definiteness: 'indefinite' }) }, 'ja')).toBe('二十四時間。');
    expect(say({ subject: np('MONTH', { numeral: 12, definiteness: 'indefinite' }) }, 'ja')).toBe('十二か月。');
  });
});
