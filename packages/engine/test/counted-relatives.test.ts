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

// Coverage audit of P11-E5: the compound across the three words, the counts, every person that can
// be the subject, the clause's own grammar around it (negation, tense, question), a definite
// predicate, and the Japanese noun-phrase shapes it has to survive. The other six are plain cardinals.
describe('the compound across words, counts and subjects', () => {
  const are = (subject: NounPhrase, phrase: NounPhrase, verbPhrase: Partial<PhrasePlan['verbPhrase']> = {}): PhrasePlan => ({
    subject, verbPhrase: { verb: 'BE', ...verbPhrase }, complements: { predicative: { phrase } },
  });
  const counted = (concept: string, numeral: number) => np(concept, { numeral, definiteness: 'indefinite' });
  const we = np('FIRST_PERSON', { number: 'plural' });

  test('three sisters and three brothers', () => {
    expect(sayAll(weAre(counted('SISTER', 3)))).toEqual({
      en: 'we are three sisters.', it: 'siamo tre sorelle.', fr: 'nous sommes trois sœurs.',
      de: 'wir sind drei Schwestern.', es: 'somos tres hermanas.', ja: '私たちは三人姉妹です。', pt: 'somos três irmãs.',
    });
    expect(sayAll(weAre(counted('BROTHER', 3)))).toEqual({
      en: 'we are three brothers.', it: 'siamo tre fratelli.', fr: 'nous sommes trois frères.',
      de: 'wir sind drei Brüder.', es: 'somos tres hermanos.', ja: '私たちは三人兄弟です。', pt: 'somos três irmãos.',
    });
  });

  test('two, four and ten', () => {
    expect(sayAll(weAre(counted('SIBLING', 2)))).toEqual({
      en: 'we are two siblings.', it: 'siamo due fratelli.', fr: 'nous sommes deux frères et sœurs.',
      de: 'wir sind zwei Geschwister.', es: 'somos dos hermanos.', ja: '私たちは二人兄弟です。', pt: 'somos dois irmãos.',
    });
    expect(sayAll(weAre(counted('SISTER', 4)))).toEqual({
      en: 'we are four sisters.', it: 'siamo quattro sorelle.', fr: 'nous sommes quatre sœurs.',
      de: 'wir sind vier Schwestern.', es: 'somos cuatro hermanas.', ja: '私たちは四人姉妹です。', pt: 'somos quatro irmãs.',
    });
    expect(sayAll(weAre(counted('SIBLING', 10)))).toEqual({
      en: 'we are ten siblings.', it: 'siamo dieci fratelli.', fr: 'nous sommes dix frères et sœurs.',
      de: 'wir sind zehn Geschwister.', es: 'somos diez hermanos.', ja: '私たちは十人兄弟です。', pt: 'somos dez irmãos.',
    });
  });

  test('you (plural) and they (feminine)', () => {
    expect(sayAll(are(np('SECOND_PERSON', { number: 'plural' }), counted('SIBLING', 3)))).toEqual({
      en: 'you are three siblings.', it: 'siete tre fratelli.', fr: 'vous êtes trois frères et sœurs.',
      de: 'ihr seid drei Geschwister.', es: 'sois tres hermanos.', ja: 'あなたたちは三人兄弟です。', pt: 'são três irmãos.',
    });
    expect(sayAll(are(np('THIRD_PERSON', { number: 'plural', gender: 'fem' }), counted('SISTER', 3)))).toEqual({
      en: 'they are three sisters.', it: 'sono tre sorelle.', fr: 'elles sont trois sœurs.',
      de: 'sie sind drei Schwestern.', es: 'son tres hermanas.', ja: '彼女らは三人姉妹です。', pt: 'são três irmãs.',
    });
  });

  test('negated, in the past and as a question', () => {
    expect(sayAll(are(we, counted('SIBLING', 3), { negative: true }))).toEqual({
      en: 'we are not three siblings.', it: 'non siamo tre fratelli.', fr: 'nous ne sommes pas trois frères et sœurs.',
      de: 'wir sind keine drei Geschwister.', es: 'no somos tres hermanos.', ja: '私たちは三人兄弟ではありません。',
      pt: 'não somos três irmãos.',
    });
    expect(sayAll(are(we, counted('SIBLING', 3), { tense: 'past' }))).toEqual({
      en: 'we were three siblings.', it: 'eravamo tre fratelli.', fr: 'nous étions trois frères et sœurs.',
      de: 'wir waren drei Geschwister.', es: 'éramos tres hermanos.', ja: '私たちは三人兄弟でした。', pt: 'éramos três irmãos.',
    });
    expect(sayAll({ ...are(we, counted('SIBLING', 3)), interrogative: true })).toEqual({
      en: 'are we three siblings?', it: 'siamo tre fratelli?', fr: 'est-ce que nous sommes trois frères et sœurs\u00a0?',
      de: 'sind wir drei Geschwister?', es: '¿somos tres hermanos?', ja: '私たちは三人兄弟ですか？', pt: 'somos três irmãos?',
    });
  });

  test('a definite predicate keeps its article in the six, and Japanese still compounds', () => {
    expect(sayAll(are(we, np('SIBLING', { numeral: 3, definiteness: 'definite' })))).toEqual({
      en: 'we are the three siblings.', it: 'siamo i tre fratelli.', fr: 'nous sommes les trois frères et sœurs.',
      de: 'wir sind die drei Geschwister.', es: 'somos los tres hermanos.', ja: '私たちは三人兄弟です。', pt: 'somos os três irmãos.',
    });
  });
});

describe('the Japanese noun-phrase shapes around the compound', () => {
  test('a demonstrative, a relative clause and a possessor stand in front of it', () => {
    expect(sayAll(clause(np('SISTER', { numeral: 3, definiteness: 'this' }), 'RUN'))).toEqual({
      en: 'these three sisters run.', it: 'queste tre sorelle corrono.', fr: 'ces trois sœurs courent.',
      de: 'diese drei Schwestern laufen.', es: 'estas tres hermanas corren.', ja: 'この三人姉妹は走ります。',
      pt: 'estas três irmãs correm.',
    });
    expect(sayAll(clause(np('SIBLING', { numeral: 3, relative: { verbPhrase: { verb: 'EAT' } } }), 'RUN'))).toEqual({
      en: 'the three siblings who eat run.', it: 'i tre fratelli che mangiano corrono.',
      fr: 'les trois frères et sœurs qui mangent courent.', de: 'die drei Geschwister, die essen, laufen.',
      es: 'los tres hermanos que comen corren.', ja: '食べる三人兄弟は走ります。', pt: 'os três irmãos que comem correm.',
    });
    expect(sayAll(clause(np('SIBLING', { numeral: 3, possessor: of('1', 'plural') }), 'RUN'))).toEqual({
      en: 'our three siblings run.', it: 'i nostri tre fratelli corrono.', fr: 'nos trois frères et sœurs courent.',
      de: 'unsere drei Geschwister laufen.', es: 'nuestros tres hermanos corren.', ja: '私たちの三人兄弟は走ります。',
      pt: 'os nossos três irmãos correm.',
    });
  });

  test('a fused elder or younger sibling is another word, and links with の', () => {
    expect(sayAll(clause(np('SISTER', { numeral: 3, adjectives: ['ELDER'] }), 'RUN'))).toEqual({
      en: 'the three older sisters run.', it: 'le tre sorelle maggiori corrono.', fr: 'les trois sœurs aînées courent.',
      de: 'die drei älteren Schwestern laufen.', es: 'las tres hermanas mayores corren.', ja: '三人の姉は走ります。',
      pt: 'as três irmãs mais velhas correm.',
    });
    expect(sayAll(clause(np('BROTHER', { numeral: 3, adjectives: ['YOUNGER'] }), 'RUN'))).toEqual({
      en: 'the three younger brothers run.', it: 'i tre fratelli minori corrono.', fr: 'les trois frères cadets courent.',
      de: 'die drei jüngeren Brüder laufen.', es: 'los tres hermanos menores corren.', ja: '三人の弟は走ります。',
      pt: 'os três irmãos mais novos correm.',
    });
  });
});

// A331. The compound says how many siblings there are in a family, so it needs two at least: 二人兄弟,
// 三人姉妹. There is no one-person 一人兄弟 or 一人姉妹 (an only child is 一人っ子), so at one the count
// links with の like any other counted phrase: 一人の兄弟, "one sibling".
describe('known bugs: Japanese compounds a count of one onto 兄弟 (A331)', () => {
  const iAm = (phrase: NounPhrase, subject: NounPhrase = np('FIRST_PERSON')): PhrasePlan => ({
    subject, verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase } },
  });
  const one = (concept: string) => np(concept, { numeral: 1, definiteness: 'indefinite' });

  test('one sibling, as a predicate', () => {
    expect(say(iAm(one('SIBLING')), 'ja')).toBe('私は一人の兄弟です。');
  });
  test('one brother, as a predicate', () => {
    expect(say(iAm(one('BROTHER')), 'ja')).toBe('私は一人の兄弟です。');
  });
  test('one sister, as a predicate', () => {
    expect(say(iAm(one('SISTER'), np('FIRST_PERSON', { gender: 'fem' })), 'ja')).toBe('私は一人の姉妹です。');
  });
  test('one sibling, as a subject', () => {
    expect(runs(one('SIBLING'))).toBe('一人の兄弟は走ります。');
  });

  test('regression: two and three compound, a word that never compounds links at one, and the six are right', () => {
    expect(say(weAre(np('SIBLING', { numeral: 2, definiteness: 'indefinite' })), 'ja')).toBe('私たちは二人兄弟です。');
    expect(say(weAre(np('SISTER', { numeral: 3, definiteness: 'indefinite' })), 'ja')).toBe('私たちは三人姉妹です。');
    expect(say(iAm(one('COUSIN')), 'ja')).toBe('私は一人のいとこです。');
    expect(sayAll(iAm(one('SIBLING')))).toMatchObject({
      en: 'I am one sibling.', it: 'sono un fratello.', fr: 'je suis un frère.', de: 'ich bin ein Geschwister.',
      es: 'soy un hermano.', pt: 'sou um irmão.',
    });
  });

  test('one links with の in every slot, and a definite one too; ten still compounds', () => {
    expect({
      sisterRuns: runs(one('SISTER')),
      seesOne: say(clause(np('MAN'), 'SEE', { directObject: one('SIBLING') }), 'ja'),
      definiteOne: runs(np('SIBLING', { numeral: 1 })),
      ten: say(weAre(np('SIBLING', { numeral: 10, definiteness: 'indefinite' })), 'ja'),
    }).toEqual({
      sisterRuns: '一人の姉妹は走ります。',
      seesOne: '男は一人の兄弟を見ます。',
      definiteOne: '一人の兄弟は走ります。',
      ten: '私たちは十人兄弟です。',
    });
  });
});
