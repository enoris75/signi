import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase, PronominalPossessor, RelativeClause, Specifier } from '@signi/shared';
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

// Where the role goes once the clause around it changes shape. German keeps it in the Mittelfeld, ahead
// of a split verb's second half and of a subordinate clause's verb; Japanese keeps it with the
// adjuncts, ahead of the object, whatever the verb's ending.
describe('role in the other clause shapes', () => {
  test('a resultative: German splits the verb around it', () => {
    expect(sayAll(clause(np('MAN'), 'ACT', { verbPhrase: { aspect: 'resultative' }, complements: { role: { phrase: np('FRIEND') } } }))).toEqual({
      en: 'the man has acted as a friend.',
      it: "l'uomo ha agito come amico.",
      fr: "l'homme a agi comme ami.",
      de: 'der Mann hat als Freund gehandelt.',
      es: 'el hombre ha actuado como amigo.',
      ja: '男は友達として行動しました。',
      pt: 'o homem agiu como amigo.',
    });
  });

  test('a modal: the infinitive goes last, after the role', () => {
    expect(sayAll(clause(np('MAN'), 'ACT', { verbPhrase: { modals: ['MUST'] }, complements: { role: { phrase: np('FRIEND') } } }))).toEqual({
      en: 'the man must act as a friend.',
      it: "l'uomo deve agire come amico.",
      fr: "l'homme doit agir comme ami.",
      de: 'der Mann muss als Freund handeln.',
      es: 'el hombre debe actuar como amigo.',
      ja: '男は友達として行動する必要があります。',
      pt: 'o homem deve agir como amigo.',
    });
  });

  test('a because-clause: the German verb goes last, the role stays behind the object', () => {
    expect(sayAll(clause(np('WOMAN'), 'RUN', {
      adverbialClause: {
        conjunction: 'because',
        clause: { subject: np('MAN'), verbPhrase: { verb: 'READ' }, directObject: np('BOOK'), complements: { role: { phrase: np('STUDENT') } } },
      },
    }))).toEqual({
      en: 'the woman runs because the man reads the book as a student.',
      it: 'la donna corre perché l\'uomo legge il libro come studente.',
      fr: 'la femme court parce que l\'homme lit le livre comme étudiant.',
      de: 'die Frau läuft, weil der Mann das Buch als Student liest.',
      es: 'la mujer corre porque el hombre lee el libro como estudiante.',
      ja: '女は男が学生として本を読むので走ります。',
      pt: 'a mulher corre porque o homem lê o livro como estudante.',
    });
  });

  test('a negation beside an object: German "nicht" goes ahead of the role', () => {
    expect(sayAll(clause(np('MAN'), 'READ', {
      verbPhrase: { negative: true }, directObject: np('BOOK'), complements: { role: { phrase: np('STUDENT') } },
    }))).toEqual({
      en: 'the man does not read the book as a student.',
      it: "l'uomo non legge il libro come studente.",
      fr: "l'homme ne lit pas le livre comme étudiant.",
      de: 'der Mann liest das Buch nicht als Student.',
      es: 'el hombre no lee el libro como estudiante.',
      ja: '男は学生として本を読みません。',
      pt: 'o homem não lê o livro como estudante.',
    });
  });

  test('a passive: the role stays the agent\'s, after the by-phrase', () => {
    expect(sayAll(clause(np('MAN'), 'READ', {
      verbPhrase: { voice: 'passive' }, directObject: np('BOOK'), complements: { role: { phrase: np('STUDENT') } },
    }))).toEqual({
      en: 'the book is read by the man as a student.',
      it: "il libro è letto dall'uomo come studente.",
      fr: "le livre est lu par l'homme comme étudiant.",
      de: 'das Buch wird vom Mann als Student gelesen.',
      es: 'el libro es leído por el hombre como estudiante.',
      ja: '本は男に学生として読まれます。',
      pt: 'o livro é lido pelo homem como estudante.',
    });
  });

  test('inside a subject relative', () => {
    expect(sayAll(clause(np('MAN', { relative: { verbPhrase: { verb: 'ACT' }, complements: { role: { phrase: np('FRIEND') } } } }), 'RUN'))).toEqual({
      en: 'the man who acts as a friend runs.',
      it: "l'uomo che agisce come amico corre.",
      fr: "l'homme qui agit comme ami court.",
      de: 'der Mann, der als Freund handelt, läuft.',
      es: 'el hombre que actúa como amigo corre.',
      ja: '友達として行動する男は走ります。',
      pt: 'o homem que age como amigo corre.',
    });
  });

  test('inside a content clause', () => {
    expect(sayAll(clause(np('WOMAN'), 'KNOW', {
      contentObject: { subject: np('MAN'), verbPhrase: { verb: 'ACT' }, complements: { role: { phrase: np('FRIEND') } } },
    }))).toEqual({
      en: 'the woman knows that the man acts as a friend.',
      it: "la donna sa che l'uomo agisce come amico.",
      fr: "la femme sait que l'homme agit comme ami.",
      de: 'die Frau weiß, dass der Mann als Freund handelt.',
      es: 'la mujer sabe que el hombre actúa como amigo.',
      ja: '女は男が友達として行動することを知っています。',
      pt: 'a mulher sabe que o homem age como amigo.',
    });
  });

  test('an imperative, a yes/no question and a who-question', () => {
    const role = { role: { phrase: np('FRIEND') } };
    expect(sayAll(clause(np('MAN'), 'ACT', { imperative: true, complements: role }))).toEqual({
      en: 'act as a friend.', it: 'agisci come amico.', fr: 'agis comme ami.', de: 'handle als Freund.',
      es: 'actúa como amigo.', ja: '友達として行動してください。', pt: 'aja como amigo.',
    });
    expect(sayAll(clause(np('MAN'), 'ACT', { interrogative: true, complements: role }))).toEqual({
      en: 'does the man act as a friend?', it: "l'uomo agisce come amico?", fr: "est-ce que l'homme agit comme ami ?",
      de: 'handelt der Mann als Freund?', es: '¿el hombre actúa como amigo?', ja: '男は友達として行動しますか？',
      pt: 'o homem age como amigo?',
    });
    expect(sayAll(clause(np('MAN'), 'ACT', { interrogative: true, questionRole: 'subject', questionAnimate: true, complements: role }))).toEqual({
      en: 'who acts as a friend?', it: 'chi agisce come amico?', fr: 'qui agit comme ami ?', de: 'wer handelt als Freund?',
      es: '¿quién actúa como amigo?', ja: '誰が友達として行動しますか？', pt: 'quem age como amigo?',
    });
  });

  test('an "or" group repeats the marker as "and" does', () => {
    expect(actsAs({ conjunction: 'or', conjuncts: [np('FRIEND'), np('STUDENT')] })).toEqual({
      en: 'the man acts as a friend or a student.',
      it: "l'uomo agisce come amico o come studente.",
      fr: "l'homme agit comme ami ou comme étudiant.",
      de: 'der Mann handelt als Freund oder als Student.',
      es: 'el hombre actúa como amigo o como estudiante.',
      ja: '男は友達か学生として行動します。',
      pt: 'o homem age como amigo ou como estudante.',
    });
  });
});

// What the role's noun carries: the bare-role rule (D3) drops the article and nothing else. An
// attributive adjective agrees with the role noun and declines strong in German (no article to carry
// the ending); a genitive possessor follows it as it follows any noun.
describe('role: the noun\'s own modifiers', () => {
  test('an attributive adjective', () => {
    expect(actsAs(np('FRIEND', { adjectives: ['GOOD'] }))).toEqual({
      en: 'the man acts as a good friend.',
      it: "l'uomo agisce come buon amico.",
      fr: "l'homme agit comme bon ami.",
      de: 'der Mann handelt als guter Freund.',
      es: 'el hombre actúa como amigo bueno.',
      ja: '男は良い友達として行動します。',
      pt: 'o homem age como amigo bom.',
    });
  });

  test('a feminine attributive adjective', () => {
    expect(actsAs(np('FRIEND', { gender: 'fem', adjectives: ['OLD'] }), np('WOMAN'))).toEqual({
      en: 'the woman acts as an old friend.',
      it: 'la donna agisce come vecchia amica.',
      fr: 'la femme agit comme vieille amie.',
      de: 'die Frau handelt als alte Freundin.',
      es: 'la mujer actúa como amiga vieja.',
      ja: '女は古い友達として行動します。',
      pt: 'a mulher age como amiga velha.',
    });
  });

  test('a genitive possessor — the role noun stays bare in front of it', () => {
    expect(actsAs(np('FRIEND', { possessor: np('WOMAN') }))).toEqual({
      en: "the man acts as the woman's friend.",
      it: "l'uomo agisce come amico della donna.",
      fr: "l'homme agit comme ami de la femme.",
      de: 'der Mann handelt als Freund der Frau.',
      es: 'el hombre actúa como amigo de la mujer.',
      ja: '男は女の友達として行動します。',
      pt: 'o homem age como amigo da mulher.',
    });
  });

  // A270 guard: the nominative of a feminine weak noun takes no weak ending ("als Studentin").
  test('a feminine plural, and the feminine of a weak noun', () => {
    expect(actsAs(np('FRIEND', { gender: 'fem', number: 'plural' }), np('WOMAN', { number: 'plural' }))).toEqual({
      en: 'the women act as friends.',
      it: 'le donne agiscono come amiche.',
      fr: 'les femmes agissent comme amies.',
      de: 'die Frauen handeln als Freundinnen.',
      es: 'las mujeres actúan como amigas.',
      ja: '女は友達として行動します。',
      pt: 'as mulheres agem como amigas.',
    });
    expect(sayAll(clause(np('WOMAN'), 'READ', {
      directObject: np('BOOK'), complements: { role: { phrase: np('STUDENT', { gender: 'fem' }) } },
    }))).toEqual({
      en: 'the woman reads the book as a student.',
      it: 'la donna legge il libro come studentessa.',
      fr: 'la femme lit le livre comme étudiante.',
      de: 'die Frau liest das Buch als Studentin.',
      es: 'la mujer lee el libro como estudiante.',
      ja: '女は学生として本を読みます。',
      pt: 'a mulher lê o livro como estudante.',
    });
  });
});

// A287. D3 keeps the Romance role noun bare, since only the article tells "come amico" (the role)
// from "come un amico" (the likeness). Italian's pronominal possessor brings its own definite article
// back ("il suo amico"), and "come il suo amico" reads as the likeness again. The essive object
// predicative shares the helper, and the defect. The other six are right. English is not pinned as a
// regression here: A277 re-spells an indefinite head with a pronominal possessor ("a friend of mine",
// "un mio amico"), and the role noun is indefinite by default.
describe('known bugs: an Italian role or essive noun with a pronominal possessor takes the article (A287)', () => {
  const his: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' };
  const her: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'singular', gender: 'fem' };

  test('the role noun stays bare before the possessive', () => {
    expect(actsAs(np('FRIEND', { possessor: his }))['it']).toBe("l'uomo agisce come suo amico.");
  });

  test('a feminine role noun', () => {
    expect(actsAs(np('FRIEND', { gender: 'fem', possessor: her }), np('WOMAN'))['it']).toBe('la donna agisce come sua amica.');
  });

  test('the essive object predicative', () => {
    expect(say(clause(np('MAN'), 'USE', {
      directObject: np('BOOK'),
      complements: { objectPredicative: { phrase: np('FRIEND', { possessor: his }), specifiers: ESSIVE } },
    }), 'it')).toBe("l'uomo usa il libro come suo amico.");
  });

  test('the plural, the first person and "loro" stay bare too, and a plain object keeps its article', () => {
    expect(actsAs(np('FRIEND', { number: 'plural', possessor: his }), np('MAN', { number: 'plural' }))['it'])
      .toBe('gli uomini agiscono come suoi amici.');
    expect(actsAs(np('FRIEND', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }))['it'])
      .toBe("l'uomo agisce come mio amico.");
    expect(actsAs(np('FRIEND', { possessor: { kind: 'pronominal', person: '3', number: 'plural', gender: 'masc' } }))['it'])
      .toBe("l'uomo agisce come loro amico.");
    expect(say(clause(np('MAN'), 'SEE', { directObject: np('FRIEND', { possessor: his }) }), 'it')).toBe("l'uomo vede il suo amico.");
  });

  test('regression: the other Romance languages and German, and a genitive possessor in Italian', () => {
    expect(actsAs(np('FRIEND', { possessor: his }))).toMatchObject({
      fr: "l'homme agit comme son ami.",
      de: 'der Mann handelt als sein Freund.',
      es: 'el hombre actúa como su amigo.',
      pt: 'o homem age como seu amigo.',
    });
    expect(actsAs(np('FRIEND', { gender: 'fem', possessor: her }), np('WOMAN'))).toMatchObject({
      fr: 'la femme agit comme son amie.',
      de: 'die Frau handelt als ihre Freundin.',
      es: 'la mujer actúa como su amiga.',
      pt: 'a mulher age como sua amiga.',
    });
    expect(actsAs(np('FRIEND', { possessor: np('WOMAN') }))['it']).toBe("l'uomo agisce come amico della donna.");
    expect(say(clause(np('MAN'), 'USE', {
      directObject: np('BOOK'),
      complements: { objectPredicative: { phrase: np('FRIEND', { possessor: np('WOMAN') }), specifiers: ESSIVE } },
    }), 'it')).toBe("l'uomo usa il libro come amico della donna.");
  });
});

// A288. A relative clause whose gap is the role ("the friend the man acts as") has no natural
// relative in Romance or German: "come quale", "comme quel", "como que", "como qual", and a German
// "als" with no relative pronoun and a double space. No control builds one and randomPhrase leaves
// it out, but the plan API accepts it. The target is a refusal, as a role question is refused
// (resolveQuestion.test.ts); a refusal has no correct output to pin, so the pin asserts the throw.
describe('known bugs: a relative clause over a role gap renders nonsense (A288)', () => {
  const actsAsWhom = (): RelativeClause => ({ headRole: 'role', subject: np('MAN'), verbPhrase: { verb: 'ACT' } });

  test.fails('the role gap is refused by name, as the object', () => {
    expect(() => sayAll(clause(np('WOMAN'), 'SEE', { directObject: np('FRIEND', { relative: actsAsWhom() }) }))).toThrow(/role/);
  });

  test.fails('the role gap is refused by name, as the subject', () => {
    expect(() => sayAll(clause(np('FRIEND', { relative: actsAsWhom() }), 'RUN'))).toThrow(/role/);
  });

  // Japanese is left out of the comitative row: 男が行動する友達 drops its company (A290).
  test('regression: a comitative gap on the same clause, and a role inside an object relative', () => {
    expect(sayAll(clause(np('FRIEND', { relative: { ...actsAsWhom(), headRole: 'comitative' } }), 'RUN'))).toMatchObject({
      en: 'the friend with whom the man acts runs.',
      it: "l'amico con il quale l'uomo agisce corre.",
      fr: "l'ami avec lequel l'homme agit court.",
      de: 'der Freund, mit dem der Mann handelt, läuft.',
      es: 'el amigo con el que el hombre actúa corre.',
      pt: 'o amigo com o qual o homem age corre.',
    });
    expect(sayAll(clause(np('BOOK', {
      relative: { headRole: 'directObject', subject: np('MAN'), verbPhrase: { verb: 'READ' }, complements: { role: { phrase: np('STUDENT') } } },
    }), 'BURN'))).toEqual({
      en: 'the book that the man reads as a student burns.',
      it: "il libro che l'uomo legge come studente brucia.",
      fr: "le livre que l'homme lit comme étudiant brûle.",
      de: 'das Buch, das der Mann als Student liest, brennt.',
      es: 'el libro que el hombre lee como estudiante arde.',
      ja: '男が学生として読む本は燃えます。',
      pt: 'o livro que o homem lê como estudante arde.',
    });
  });
});
