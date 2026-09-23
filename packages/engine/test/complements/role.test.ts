import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase, Specifier } from '@signi/shared';
import { clause, np, say, sayAll } from '../harness.js';

// The ROLE complement (P09-E13) — the capacity the subject acts in while the verb does something
// else: "acts as a friend", "reads the book as a student". Its word, its bare noun and its seven
// spellings are the essive object complement's (as / come / comme / como / als / として); only the
// controller differs, the subject instead of the object — which is the whole difference in German
// (nominative, not accusative) and in Japanese (with the adjuncts, ahead of the object). Plan-only:
// no box yet.
const ESSIVE: Specifier[] = [{ kind: 'predication', value: 'essive' }];

const actsAs = (phrase: NounElement, subject: NounPhrase = np('MAN'), tense?: 'past') =>
  sayAll(clause(subject, 'ACT', { verbPhrase: tense ? { tense } : {}, complements: { role: { phrase } } }));

const readsAs = (phrase: NounElement) =>
  sayAll(clause(np('MAN'), 'READ', { directObject: np('BOOK'), complements: { role: { phrase } } }));

describe('role', () => {
  test('the woman acts as a friend — the role takes the plan’s own gender (D5)', () => {
    expect(actsAs(np('FRIEND', { gender: 'fem' }), np('WOMAN'))).toEqual({
      en: 'the woman acts as a friend.',
      it: 'la donna agisce come amica.',
      fr: 'la femme agit comme amie.',
      de: 'die Frau handelt als Freundin.',
      es: 'la mujer actúa como amiga.',
      ja: '女は友達として行動します。',
      pt: 'a mulher age como amiga.',
    });
  });

  test('the man acts as a friend', () => {
    expect(actsAs(np('FRIEND'))).toEqual({
      en: 'the man acts as a friend.',
      it: "l'uomo agisce come amico.",
      fr: "l'homme agit comme ami.",
      de: 'der Mann handelt als Freund.',
      es: 'el hombre actúa como amigo.',
      ja: '男は友達として行動します。',
      pt: 'o homem age como amigo.',
    });
  });

  test('the man reads the book as a student — beside a direct object', () => {
    expect(readsAs(np('STUDENT'))).toEqual({
      en: 'the man reads the book as a student.',
      it: "l'uomo legge il libro come studente.",
      fr: "l'homme lit le livre comme étudiant.",
      // The subject's case: a weak noun keeps its nominative.
      de: 'der Mann liest das Buch als Student.',
      es: 'el hombre lee el libro como estudiante.',
      // With the adjuncts, ahead of the object: 本を学生として would take the book as the student.
      ja: '男は学生として本を読みます。',
      pt: 'o homem lê o livro como estudante.',
    });
  });

  test('a plural', () => {
    expect(actsAs(np('FRIEND', { number: 'plural' }), np('MAN', { number: 'plural' }))).toEqual({
      en: 'the men act as friends.',
      it: 'gli uomini agiscono come amici.',
      fr: 'les hommes agissent comme amis.',
      de: 'die Männer handeln als Freunde.',
      es: 'los hombres actúan como amigos.',
      ja: '男は友達として行動します。',
      pt: 'os homens agem como amigos.',
    });
  });

  test('a coordinated role repeats the marker where the essive does', () => {
    expect(actsAs({ conjunction: 'and', conjuncts: [np('FRIEND'), np('STUDENT')] })).toEqual({
      en: 'the man acts as a friend and a student.',
      it: "l'uomo agisce come amico e come studente.",
      fr: "l'homme agit comme ami et comme étudiant.",
      de: 'der Mann handelt als Freund und als Student.',
      es: 'el hombre actúa como amigo y como estudiante.',
      ja: '男は友達と学生として行動します。',
      pt: 'o homem age como amigo e como estudante.',
    });
  });

  test('a past tense', () => {
    expect(actsAs(np('FRIEND'), np('MAN'), 'past')).toEqual({
      en: 'the man acted as a friend.',
      it: "l'uomo agì come amico.",
      fr: "l'homme agit comme ami.", // the passé simple of agir is the present's spelling
      de: 'der Mann handelte als Freund.',
      es: 'el hombre actuó como amigo.',
      ja: '男は友達として行動しました。',
      pt: 'o homem agiu como amigo.',
    });
  });

  test('after the recipient, ahead of the rest (D6)', () => {
    expect(sayAll(clause(np('MAN'), 'GIVE', {
      directObject: np('BOOK'),
      complements: { terminus: { phrase: np('CAT') }, role: { phrase: np('FRIEND') } },
    }))).toEqual({
      en: 'the man gives the book to the cat as a friend.',
      it: "l'uomo dà il libro al gatto come amico.",
      fr: "l'homme donne le livre au chat comme ami.",
      de: 'der Mann gibt dem Kater das Buch als Freund.',
      es: 'el hombre da el libro al gato como amigo.',
      ja: '男は猫に友達として本をあげます。',
      pt: 'o homem dá o livro ao gato como amigo.',
    });
  });
});

// D3: the Romance four spell the role and the likeness alike (come / comme / como), and only the
// article tells them apart — so the role's noun is bare whatever determiner the plan carries.
// English keeps the one it is given, and defaults it to the indefinite.
describe('role: the article', () => {
  test('a definite role is bare everywhere but English', () => {
    expect(actsAs(np('FRIEND', { definiteness: 'definite' }))).toEqual({
      en: 'the man acts as the friend.',
      it: "l'uomo agisce come amico.",
      fr: "l'homme agit comme ami.",
      de: 'der Mann handelt als Freund.',
      es: 'el hombre actúa como amigo.',
      ja: '男は友達として行動します。',
      pt: 'o homem age como amigo.',
    });
  });

  test('the unchosen determiner is the indefinite', () => {
    expect(say(clause(np('MAN'), 'ACT', { complements: { role: { phrase: np('FRIEND') } } }), 'en'))
      .toBe('the man acts as a friend.');
  });

  test('the similative manner is untouched — "like", "come un", "wie", のように', () => {
    expect(sayAll(clause(np('MAN'), 'ACT', {
      complements: { manner: { phrase: np('FRIEND', { definiteness: 'indefinite' }) } },
    }))).toEqual({
      en: 'the man acts like a friend.',
      it: "l'uomo agisce come un amico.",
      fr: "l'homme agit comme un ami.",
      de: 'der Mann handelt wie ein Freund.',
      es: 'el hombre actúa como un amigo.',
      ja: '男は友達のように行動します。',
      pt: 'o homem age como um amigo.',
    });
  });
});

// D2: the controller is per construction. The same noun on the same kind of verb is nominative and
// before the object as a role, accusative and after it as the object's essive.
describe('role against the essive object complement', () => {
  const usesAs = sayAll(clause(np('MAN'), 'USE', {
    directObject: np('BOOK'),
    complements: { objectPredicative: { phrase: np('STUDENT'), specifiers: ESSIVE } },
  }));

  test('German: the role is nominative, the essive accusative', () => {
    expect(readsAs(np('STUDENT'))['de']).toBe('der Mann liest das Buch als Student.');
    expect(usesAs['de']).toBe('der Mann verwendet das Buch als Studenten.');
  });

  test('Japanese: the role precedes the object, the essive follows it', () => {
    expect(readsAs(np('STUDENT'))['ja']).toBe('男は学生として本を読みます。');
    expect(usesAs['ja']).toBe('男は本を学生として使います。');
  });
});

// D4: a role names a class, so its head is a noun. An adjective is the depictive and a pronoun no
// role; the translator drops the complement rather than render either.
describe('role: noun heads only', () => {
  const bare = {
    en: 'the man acts.',
    it: "l'uomo agisce.",
    fr: "l'homme agit.",
    de: 'der Mann handelt.',
    es: 'el hombre actúa.',
    ja: '男は行動します。',
    pt: 'o homem age.',
  };

  test('an adjective head renders nothing', () => {
    expect(actsAs(np('HAPPY'))).toEqual(bare);
  });

  test('a pronoun head renders nothing', () => {
    expect(actsAs(np('THIRD_PERSON'))).toEqual(bare);
  });

  test('a group holding either renders nothing', () => {
    expect(actsAs({ conjunction: 'and', conjuncts: [np('FRIEND'), np('HAPPY')] })).toEqual(bare);
  });
});
