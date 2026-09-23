import { describe, expect, test } from 'vitest';
import type { ContentClause, NounElement, NounPhrase, PronominalPossessor } from '@signi/shared';
import { clause, furigana, np, say, sayAll } from './harness.js';

// P11-E1: the verb register Japanese picks from **whose** the subject is. Someone else's relative
// is raised with the honorific word (尊敬語) automatically; the speaker's own side is lowered with
// the humble one (謙譲語) only when the plan asks (`VerbPhrase.humble`, D4). Both are suppletive,
// stored as a small paradigm on the lexeme (`honorific`, `humble`), and only a kin subject triggers
// either (D3). The other six languages change nothing.

const of = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number });
const yourMother = np('MOTHER', { possessor: of('2') });
const myFather = np('FATHER', { possessor: of('1') });
const ja = (subject: NounElement, verb: string, extra: NonNullable<Parameters<typeof clause>[2]> = {}) =>
  say(clause(subject, verb, extra), 'ja');
const home = { locative: { phrase: np('HOUSE') } };
const and = (...conjuncts: NounPhrase[]): NounElement => ({ conjuncts, conjunction: 'and' });
/** A clause standing inside another: its subject and its verb. */
const inner = (subject: NounElement, verb: string): ContentClause => ({ subject, verbPhrase: { verb } });
type Extra = NonNullable<Parameters<typeof clause>[2]>;

describe('the table: someone else\'s relative takes the honorific, one\'s own and the rest the plain verb', () => {
  test('your mother is (at home)', () => {
    expect(ja(yourMother, 'BE', { complements: home })).toBe('あなたのお母さんは家にいらっしゃいます。');
    expect(ja(yourMother, 'BE')).toBe('あなたのお母さんはいらっしゃいます。');
  });
  test('your mother eats', () => {
    expect(ja(yourMother, 'EAT')).toBe('あなたのお母さんは召し上がります。');
  });
  test('my father comes: plain, unless the plan asks for the humble', () => {
    expect(ja(myFather, 'COME')).toBe('父は来ます。');
    expect(ja(myFather, 'COME', { verbPhrase: { humble: true } })).toBe('父は参ります。');
  });
  test('the cat eats', () => {
    expect(ja(np('CAT'), 'EAT')).toBe('猫は食べます。');
  });
  test('the other six languages are untouched', () => {
    expect(sayAll(clause(yourMother, 'EAT'))).toEqual({
      en: 'your mother eats.', it: 'tua madre mangia.', fr: 'ta mère mange.', de: 'deine Mutter isst.',
      es: 'tu madre come.', ja: 'あなたのお母さんは召し上がります。', pt: 'a sua mãe come.',
    });
    const { ja: _honorific, ...plain } = sayAll(clause(myFather, 'COME', { verbPhrase: { humble: true } }));
    const { ja: _plain, ...asked } = sayAll(clause(myFather, 'COME'));
    expect(plain).toEqual(asked);
  });
});

describe('every verb with a register of its own', () => {
  test.each<[string, Extra, string, string]>([
    ['GO', {}, 'あなたのお母さんはいらっしゃいます。', '父は参ります。'],
    ['COME', {}, 'あなたのお母さんはいらっしゃいます。', '父は参ります。'],
    ['BE', { complements: home }, 'あなたのお母さんは家にいらっしゃいます。', '父は家におります。'],
    ['EAT', {}, 'あなたのお母さんは召し上がります。', '父はいただきます。'],
    ['DRINK', {}, 'あなたのお母さんは召し上がります。', '父はいただきます。'],
    ['DO', { directObject: np('FOOD') }, 'あなたのお母さんは食べ物をなさいます。', '父は食べ物をいたします。'],
    ['SAY', { contentObject: inner(np('CAT'), 'RUN') }, 'あなたのお母さんは猫が走るとおっしゃいます。', '父は猫が走ると申します。'],
    // あげる has a humble word and no honorific: くださる is くれる's, a giving towards the speaker.
    ['GIVE', { directObject: np('FOOD') }, 'あなたのお母さんは食べ物をあげます。', '父は食べ物を差し上げます。'],
  ])('%s', (verb, extra, honorific, humble) => {
    expect(ja(yourMother, verb, extra)).toBe(honorific);
    expect(ja(myFather, verb, { ...extra, verbPhrase: { humble: true } })).toBe(humble);
  });

  test('a verb with no suppletive word keeps its plain one', () => {
    expect(ja(yourMother, 'RUN')).toBe('あなたのお母さんは走ります。');
  });
});

describe('the register conjugates like any verb', () => {
  test('tense and negation', () => {
    expect(ja(yourMother, 'EAT', { verbPhrase: { tense: 'past' } })).toBe('あなたのお母さんは召し上がりました。');
    expect(ja(yourMother, 'EAT', { verbPhrase: { tense: 'past', negative: true } })).toBe('あなたのお母さんは召し上がりませんでした。');
    expect(ja(myFather, 'COME', { verbPhrase: { negative: true, humble: true } })).toBe('父は参りません。');
  });
  test('aspect and the modal suffixes', () => {
    expect(ja(yourMother, 'EAT', { verbPhrase: { aspect: 'progressive' } })).toBe('あなたのお母さんは召し上がっています。');
    expect(ja(yourMother, 'EAT', { verbPhrase: { modals: ['WILL'] } })).toBe('あなたのお母さんは召し上がりたいです。');
    expect(ja(yourMother, 'EAT', { verbPhrase: { modals: ['CAN'] } })).toBe('あなたのお母さんは召し上がることができます。');
  });
  test('a question, and the たら of an "if" clause', () => {
    expect(say({ ...clause(yourMother, 'COME'), interrogative: true }, 'ja')).toBe('あなたのお母さんはいらっしゃいますか？');
    expect(ja(np('CAT'), 'RUN', { condition: clause(yourMother, 'COME') })).toBe('もしあなたのお母さんがいらっしゃったら、猫は走ります。');
  });
});

describe('who is raised (D3) and who is lowered (D4)', () => {
  test('someone else\'s relative, whoever the owner is', () => {
    expect(ja(np('MOTHER', { possessor: np('BOY') }), 'EAT')).toBe('男の子のお母さんは召し上がります。');
    expect(ja(np('MOTHER', { possessor: of('3') }), 'EAT')).toBe('彼のお母さんは召し上がります。');
  });
  test('no one to be polite to: no owner, an animal\'s, a kind of person\'s', () => {
    expect(ja(np('MOTHER'), 'EAT')).toBe('母親は食べます。');
    expect(ja(np('MOTHER', { possessor: np('CAT') }), 'EAT')).toBe('猫の母は食べます。');
    expect(ja(np('MOTHER', { possessor: np('CHILD', { definiteness: 'indefinite' }) }), 'EAT')).toBe('子供の母親は食べます。');
  });
  test('a subject that is not kin is never raised', () => {
    expect(ja(np('MAN'), 'EAT')).toBe('男は食べます。');
    expect(ja(np('CAT', { possessor: of('2') }), 'EAT')).toBe('あなたの猫は食べます。');
  });
  test('a coordinated subject is raised only when every conjunct is', () => {
    expect(ja(and(yourMother, np('FATHER', { possessor: of('2') })), 'EAT')).toBe('あなたのお母さんとあなたのお父さんは召し上がります。');
    expect(ja(and(yourMother, np('CAT')), 'EAT')).toBe('あなたのお母さんと猫は食べます。');
  });
  test('the humble is for the 1st person and one\'s own relative, and ignored for anyone else', () => {
    expect(ja(np('FIRST_PERSON'), 'EAT', { verbPhrase: { humble: true } })).toBe('私はいただきます。');
    expect(ja(np('CAT'), 'EAT', { verbPhrase: { humble: true } })).toBe('猫は食べます。');
    // Someone else's relative is raised whatever the plan asks.
    expect(ja(yourMother, 'COME', { verbPhrase: { humble: true } })).toBe('あなたのお母さんはいらっしゃいます。');
  });
});

describe('a plain clause keeps the plain verb', () => {
  test('a relative clause on the relative, and a clause of purpose', () => {
    expect(say({ subject: np('MOTHER', { possessor: of('2'), relative: { verbPhrase: { verb: 'EAT' } } }) }, 'ja'))
      .toBe('食べるあなたのお母さん。');
    expect(ja(yourMother, 'COME', { purpose: { verbPhrase: { verb: 'EAT' } } }))
      .toBe('あなたのお母さんは食べるためにいらっしゃいます。');
  });
  test('a clause inside another', () => {
    expect(ja(np('CAT'), 'SAY', { contentObject: inner(yourMother, 'COME') })).toBe('猫はあなたのお母さんが来ると言います。');
    expect(ja(np('CAT'), 'RUN', { adverbialClause: { conjunction: 'because', clause: inner(yourMother, 'EAT') } }))
      .toBe('猫はあなたのお母さんが食べるので走ります。');
  });
  test('a passive and a causative swap in another verb, and keep it', () => {
    expect(ja(yourMother, 'EAT', { verbPhrase: { voice: 'passive' }, directObject: np('FOOD') })).toBe('食べ物はあなたのお母さんに食べられます。');
    expect(ja(yourMother, 'LET', { directObject: np('DOG'), infinitiveComplement: { verbPhrase: { verb: 'EAT' }, control: 'object' } }))
      .toBe('あなたのお母さんは犬を食べさせます。');
  });
});

describe('furigana follows the word said', () => {
  test('a kanji register word is read as itself, a kana one takes none', () => {
    expect(furigana(clause(yourMother, 'EAT'))).toEqual(['おかあさん', 'めしあがります']);
    expect(furigana(clause(myFather, 'COME', { verbPhrase: { humble: true } }))).toEqual(['ちち', 'まいります']);
    expect(furigana(clause(np('FIRST_PERSON'), 'SAY', { contentObject: inner(np('CAT'), 'RUN'), verbPhrase: { humble: true } })))
      .toEqual(['わたし', 'ねこ', 'はしる', 'もうします']);
    // いらっしゃる and いただく are kana, and must not keep 来る's or 食べる's reading.
    expect(furigana(clause(yourMother, 'COME'))).toEqual(['おかあさん']);
    expect(furigana(clause(myFather, 'EAT', { verbPhrase: { humble: true } }))).toEqual(['ちち']);
  });
});
