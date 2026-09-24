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

// The P11-E1 coverage audit: the register reaches every conjugation path that reads the paradigm —
// the nai form under たら and a governing modal, the te form under an aspect — and every way a kin
// subject can be built, and it stays out of the clauses and languages it does not belong to.

describe('the register through the nai and te forms', () => {
  test('the negative たら is built on the register\'s nai form', () => {
    expect(ja(np('CAT'), 'RUN', { condition: { ...clause(yourMother, 'COME'), verbPhrase: { verb: 'COME', negative: true } } }))
      .toBe('もしあなたのお母さんがいらっしゃらなかったら、猫は走ります。');
    expect(ja(np('CAT'), 'RUN', { condition: { ...clause(myFather, 'COME'), verbPhrase: { verb: 'COME', negative: true, humble: true } } }))
      .toBe('もし父が参らなかったら、猫は走ります。');
  });
  test('a modal governing a negative takes the register\'s nai form', () => {
    expect(ja(yourMother, 'EAT', { verbPhrase: { modals: ['MUST'], negative: true } })).toBe('あなたのお母さんは召し上がらない必要があります。');
    expect(ja(myFather, 'GIVE', { directObject: np('FOOD'), verbPhrase: { modals: ['MUST'], negative: true, humble: true } }))
      .toBe('父は食べ物を差し上げない必要があります。');
  });
  test('the progressive is built on the register\'s te form', () => {
    expect(ja(yourMother, 'SAY', { contentObject: inner(np('CAT'), 'RUN'), verbPhrase: { aspect: 'progressive', tense: 'past' } }))
      .toBe('あなたのお母さんは猫が走るとおっしゃっていました。');
    expect(ja(myFather, 'EAT', { verbPhrase: { aspect: 'progressive', humble: true } })).toBe('父はいただいています。');
  });
});

describe('the register in a question and the prospective', () => {
  test('a wh-question keeps the honorific', () => {
    expect(say({ ...clause(yourMother, 'BE'), questionRole: 'locative' }, 'ja')).toBe('あなたのお母さんはどこにいらっしゃいますか？');
    expect(say({ ...clause(yourMother, 'EAT'), questionRole: 'directObject' }, 'ja')).toBe('あなたのお母さんは何を召し上がりますか？');
  });
  test('the prospective ところ stands on the honorific\'s dictionary form', () => {
    expect(ja(yourMother, 'COME', { verbPhrase: { aspect: 'prospective' } })).toBe('あなたのお母さんはいらっしゃるところです。');
  });
});

describe('the trigger through a chain of owners, a plural and a mixed "or"', () => {
  test('the relative of someone else\'s relative is raised', () => {
    expect(ja(np('WIFE', { possessor: np('BROTHER', { possessor: of('2') }) }), 'EAT')).toBe('あなたのご兄弟の奥さんは召し上がります。');
  });
  test('a plural relative is raised', () => {
    expect(ja(np('PARENT', { possessor: of('2'), number: 'plural' }), 'EAT')).toBe('あなたのご両親は召し上がります。');
  });
  test('the relative of one\'s own relative is lowered when asked', () => {
    expect(ja(np('WIFE', { possessor: np('BROTHER', { possessor: of('1') }) }), 'EAT', { verbPhrase: { humble: true } }))
      .toBe('兄弟の妻はいただきます。');
  });
  test('"my mother or your mother", asked for the humble, is neither raised nor lowered', () => {
    const either: NounElement = { conjuncts: [np('MOTHER', { possessor: of('1') }), yourMother], conjunction: 'or' };
    expect(ja(either, 'EAT', { verbPhrase: { humble: true } })).toBe('母かあなたのお母さんは食べます。');
  });
});

describe('every verb with a register of its own, negative and past', () => {
  // Each row: the negative, the past negative and the past, raised (your mother) and lowered (my father).
  test.each<[string, Extra, string[], string[]]>([
    ['GO', {}, ['いらっしゃいません', 'いらっしゃいませんでした', 'いらっしゃいました'], ['参りません', '参りませんでした', '参りました']],
    ['COME', {}, ['いらっしゃいません', 'いらっしゃいませんでした', 'いらっしゃいました'], ['参りません', '参りませんでした', '参りました']],
    ['BE', { complements: home }, ['家にいらっしゃいません', '家にいらっしゃいませんでした', '家にいらっしゃいました'], ['家におりません', '家におりませんでした', '家におりました']],
    ['EAT', {}, ['召し上がりません', '召し上がりませんでした', '召し上がりました'], ['いただきません', 'いただきませんでした', 'いただきました']],
    ['DRINK', {}, ['召し上がりません', '召し上がりませんでした', '召し上がりました'], ['いただきません', 'いただきませんでした', 'いただきました']],
    ['DO', { directObject: np('FOOD') }, ['食べ物をなさいません', '食べ物をなさいませんでした', '食べ物をなさいました'], ['食べ物をいたしません', '食べ物をいたしませんでした', '食べ物をいたしました']],
    ['SAY', { contentObject: inner(np('CAT'), 'RUN') }, ['猫が走るとおっしゃいません', '猫が走るとおっしゃいませんでした', '猫が走るとおっしゃいました'], ['猫が走ると申しません', '猫が走ると申しませんでした', '猫が走ると申しました']],
    ['GIVE', { directObject: np('FOOD') }, ['食べ物をあげません', '食べ物をあげませんでした', '食べ物をあげました'], ['食べ物を差し上げません', '食べ物を差し上げませんでした', '食べ物を差し上げました']],
  ])('%s', (verb, extra, honorific, humble) => {
    const forms = (subject: NounPhrase, humbleAsked: boolean) => [
      ja(subject, verb, { ...extra, verbPhrase: { humble: humbleAsked, negative: true } }),
      ja(subject, verb, { ...extra, verbPhrase: { humble: humbleAsked, negative: true, tense: 'past' } }),
      ja(subject, verb, { ...extra, verbPhrase: { humble: humbleAsked, tense: 'past' } }),
    ];
    expect(forms(yourMother, false)).toEqual(honorific.map((v) => `あなたのお母さんは${v}。`));
    expect(forms(myFather, true)).toEqual(humble.map((v) => `父は${v}。`));
  });
});

describe('the register in the bare infinitive, a coordination and an address', () => {
  test('a bare infinitive has no subject to raise', () => {
    expect(say({ ...clause(yourMother, 'EAT'), infinitive: true }, 'ja')).toBe('食べる。');
  });
  test('a coordinated clause keeps its own register', () => {
    expect(say({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'and', clause: clause(yourMother, 'EAT') } }, 'ja'))
      .toBe('猫は走ります。そして、あなたのお母さんは召し上がります。');
  });
  test('a vocative leaves the register alone', () => {
    expect(say({ ...clause(yourMother, 'EAT'), address: np('MOM') }, 'ja')).toBe('お母さん、あなたのお母さんは召し上がります。');
  });
});

describe('the other six languages ignore a negative and a progressive register', () => {
  test('a negative humble', () => {
    expect(sayAll(clause(myFather, 'EAT', { verbPhrase: { negative: true, humble: true } }))).toEqual({
      en: 'my father does not eat.', it: 'mio padre non mangia.', fr: 'mon père ne mange pas.', de: 'mein Vater isst nicht.',
      es: 'mi padre no come.', ja: '父はいただきません。', pt: 'o meu pai não come.',
    });
    const { ja: _humble, ...lowered } = sayAll(clause(myFather, 'EAT', { verbPhrase: { negative: true, humble: true } }));
    const { ja: _plain, ...plain } = sayAll(clause(myFather, 'EAT', { verbPhrase: { negative: true } }));
    expect(lowered).toEqual(plain);
  });
  test('a progressive humble', () => {
    expect(sayAll(clause(myFather, 'COME', { verbPhrase: { aspect: 'progressive', humble: true } }))).toEqual({
      en: 'my father is coming.', it: 'mio padre sta venendo.', fr: 'mon père est en train de venir.', de: 'mein Vater kommt gerade.',
      es: 'mi padre está viniendo.', ja: '父は参っています。', pt: 'o meu pai está vindo.',
    });
    const { ja: _humble, ...lowered } = sayAll(clause(myFather, 'COME', { verbPhrase: { aspect: 'progressive', humble: true } }));
    const { ja: _plain, ...plain } = sayAll(clause(myFather, 'COME', { verbPhrase: { aspect: 'progressive' } }));
    expect(lowered).toEqual(plain);
  });
});

// Known bugs — each pinned at its correct output, and flipped to a plain `test` when fixed.

describe('known bugs: the たい stem of いらっしゃる, なさる and おっしゃる is taken from the ます form (A333)', () => {
  test('いらっしゃる before たい is いらっしゃり', () => {
    expect(ja(yourMother, 'GO', { verbPhrase: { modals: ['WILL'] } })).toBe('あなたのお母さんはいらっしゃりたいです。');
    expect(ja(yourMother, 'COME', { verbPhrase: { modals: ['WILL'] } })).toBe('あなたのお母さんはいらっしゃりたいです。');
    expect(ja(yourMother, 'BE', { complements: home, verbPhrase: { modals: ['WILL'] } })).toBe('あなたのお母さんは家にいらっしゃりたいです。');
  });
  test('and in every form of たい: denied, past, bridged, and in an "if" clause', () => {
    expect(ja(yourMother, 'COME', { verbPhrase: { modals: [{ verb: 'WILL', negative: true }] } })).toBe('あなたのお母さんはいらっしゃりたくないです。');
    expect(ja(yourMother, 'COME', { verbPhrase: { modals: ['WILL'], tense: 'past' } })).toBe('あなたのお母さんはいらっしゃりたかったです。');
    expect(ja(yourMother, 'GO', { verbPhrase: { modals: ['CAN', 'WILL'] } })).toBe('あなたのお母さんはいらっしゃりたいと思うことができます。');
    expect(ja(np('CAT'), 'RUN', { condition: clause(yourMother, 'GO', { verbPhrase: { modals: ['WILL'] } }) }))
      .toBe('もしあなたのお母さんがいらっしゃりたかったら、猫は走ります。');
  });
  test('おっしゃる and なさる before たい are おっしゃり and なさり', () => {
    expect(ja(yourMother, 'SAY', { contentObject: inner(np('CAT'), 'RUN'), verbPhrase: { modals: ['WILL'] } }))
      .toBe('あなたのお母さんは猫が走るとおっしゃりたいです。');
    expect(ja(yourMother, 'DO', { directObject: np('FOOD'), verbPhrase: { modals: ['WILL'] } })).toBe('あなたのお母さんは食べ物をなさりたいです。');
  });
  test('the り stem in なさる\'s past and おっしゃる\'s denial; the dictionary and polite forms are untouched', () => {
    expect(ja(yourMother, 'DO', { directObject: np('FOOD'), verbPhrase: { modals: ['WILL'], tense: 'past' } }))
      .toBe('あなたのお母さんは食べ物をなさりたかったです。');
    expect(ja(yourMother, 'SAY', { contentObject: inner(np('CAT'), 'RUN'), verbPhrase: { modals: [{ verb: 'WILL', negative: true }] } }))
      .toBe('あなたのお母さんは猫が走るとおっしゃりたくないです。');
    expect(ja(yourMother, 'COME', { verbPhrase: { modals: ['MUST'] } })).toBe('あなたのお母さんはいらっしゃる必要があります。');
    expect(ja(yourMother, 'COME')).toBe('あなたのお母さんはいらっしゃいます。');
  });
  test('a regular honorific and the humble words take their ます stem, and the polite forms keep the い', () => {
    expect(ja(yourMother, 'EAT', { verbPhrase: { modals: ['WILL'] } })).toBe('あなたのお母さんは召し上がりたいです。');
    expect(ja(myFather, 'COME', { verbPhrase: { modals: ['WILL'], humble: true } })).toBe('父は参りたいです。');
    expect(ja(myFather, 'EAT', { verbPhrase: { modals: ['WILL'], humble: true } })).toBe('父はいただきたいです。');
    expect(ja(myFather, 'DO', { directObject: np('FOOD'), verbPhrase: { modals: ['WILL'], humble: true } })).toBe('父は食べ物をいたしたいです。');
    expect(ja(myFather, 'SAY', { contentObject: inner(np('CAT'), 'RUN'), verbPhrase: { modals: ['WILL'], humble: true } }))
      .toBe('父は猫が走ると申したいです。');
    // A denied clause under たい takes the nai form, not the stem.
    expect(ja(yourMother, 'COME', { verbPhrase: { modals: ['WILL'], negative: true } })).toBe('あなたのお母さんはいらっしゃらないでいたいです。');
    expect(ja(yourMother, 'COME', { verbPhrase: { tense: 'past', negative: true } })).toBe('あなたのお母さんはいらっしゃいませんでした。');
  });
});

describe('known bugs: the humble いる is a dialectal おる in a plain slot (A334)', () => {
  const atHome = (vp: Partial<NonNullable<Extra['verbPhrase']>>): Extra => ({ complements: home, verbPhrase: { ...vp, humble: true } });
  test.fails('an "if" clause says いたら, not おったら', () => {
    expect(ja(np('CAT'), 'RUN', { condition: clause(myFather, 'BE', atHome({})) })).toBe('もし父が家にいたら、猫は走ります。');
    expect(ja(np('CAT'), 'RUN', { condition: clause(myFather, 'BE', atHome({ negative: true })) })).toBe('もし父が家にいなかったら、猫は走ります。');
  });
  test.fails('a modal governs いる, not おる', () => {
    expect(ja(myFather, 'BE', atHome({ modals: ['MUST'] }))).toBe('父は家にいる必要があります。');
    expect(ja(myFather, 'BE', atHome({ modals: ['MUST'], negative: true }))).toBe('父は家にいない必要があります。');
    expect(ja(myFather, 'BE', atHome({ modals: ['CAN'], tense: 'past' }))).toBe('父は家にいることができました。');
  });
  test('the polite おります stays, and the other humble words stand plain', () => {
    expect(ja(myFather, 'BE', atHome({}))).toBe('父は家におります。');
    expect(ja(myFather, 'BE', atHome({ tense: 'past', negative: true }))).toBe('父は家におりませんでした。');
    expect(ja(np('CAT'), 'RUN', { condition: clause(myFather, 'GO', { verbPhrase: { humble: true } }) })).toBe('もし父が参ったら、猫は走ります。');
    expect(ja(myFather, 'GO', { verbPhrase: { modals: ['MUST'], humble: true } })).toBe('父は参る必要があります。');
  });
});
