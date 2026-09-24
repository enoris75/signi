import { describe, expect, test } from 'vitest';
import type { CoreferentPossessor, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// P11-E2: a possessor that is a **link** to its clause's subject rather than a bundle of features.
// Six of the seven say it as the possessive the subject's own features select, exactly as they say a
// pronominal possessor; Japanese says 自分の, which only the link can tell it to (D2). The subject is
// read in each language, so a German possessive agrees with the grammatical gender of its noun.

const link: CoreferentPossessor = { kind: 'coreferent', slot: 'subject' };
const sees = (subject: NounPhrase | PhrasePlan['subject'], object: NounPhrase) =>
  sayAll(clause(subject, 'SEE', { directObject: object }));

describe('a possessor linked to the subject', () => {
  test('is the ordinary possessive in six languages and 自分の in Japanese', () => {
    expect(sees(np('CAT'), np('BOOK', { possessor: link }))).toEqual({
      en: 'the cat sees its book.', it: 'il gatto vede il suo libro.', fr: 'le chat voit son livre.',
      de: 'der Kater sieht sein Buch.', es: 'el gato ve su libro.', ja: '猫は自分の本を見ます。',
      pt: 'o gato vê o seu livro.',
    });
  });

  // The six are unchanged: the link says what a pronominal possessor with the subject's features says.
  test('says in six languages what the pronominal possessor already says', () => {
    const pronominal = sees(np('MAN'), np('MOTHER', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }));
    const linked = sees(np('MAN'), np('MOTHER', { possessor: link }));
    const { ja: _j1, ...six } = pronominal;
    const { ja, ...sixLinked } = linked;
    expect(sixLinked).toEqual(six);
    expect(ja).toBe('男は自分のお母さんを見ます。');
  });

  // The honorific asks whether the possessor is a person, and the link answers from the subject's own
  // head: a cat's mother is 母, a man's お母さん — and the pronoun "I" makes her one's own, 母.
  test('picks the Japanese kin word by who the subject is', () => {
    expect(sees(np('CAT'), np('MOTHER', { possessor: link }))).toMatchObject({ ja: '猫は自分の母を見ます。' });
    expect(sees(np('BOY'), np('MOTHER', { possessor: link }))).toMatchObject({ ja: '男の子は自分のお母さんを見ます。' });
    expect(sees(np('FIRST_PERSON'), np('MOTHER', { possessor: link }))).toMatchObject({ ja: '私は自分の母を見ます。', en: 'I see my mother.' });
  });

  test('agrees with the subject the way each language reads it', () => {
    // German reads the noun's grammatical gender: die Frau → ihr. English has none to read, so it takes
    // the gender the plan names, and a person's is not guessed without one.
    expect(sees(np('WOMAN', { gender: 'fem' }), np('BOOK', { possessor: link }))).toMatchObject({
      en: 'the woman sees her book.', de: 'die Frau sieht ihr Buch.', it: 'la donna vede il suo libro.',
      fr: 'la femme voit son livre.', ja: '女は自分の本を見ます。',
    });
    expect(sees(np('WOMAN'), np('BOOK', { possessor: link }))).toMatchObject({ de: 'die Frau sieht ihr Buch.' });
    // A coordinated subject is the plural it agrees as.
    expect(sees({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' }, np('BOOK', { possessor: link }))).toEqual({
      en: 'the cat and the dog see their book.', it: 'il gatto e il cane vedono il loro libro.',
      fr: 'le chat et le chien voient leur livre.', de: 'der Kater und der Hund sehen ihr Buch.',
      es: 'el gato y el perro ven su libro.', ja: '猫と犬は自分の本を見ます。', pt: 'o gato e o cão veem o seu livro.',
    });
    // A pronoun subject lends its person.
    expect(sees(np('FIRST_PERSON'), np('BOOK', { possessor: link }))).toEqual({
      en: 'I see my book.', it: 'vedo il mio libro.', fr: 'je vois mon livre.', de: 'ich sehe mein Buch.',
      es: 'veo mi libro.', ja: '私は自分の本を見ます。', pt: 'vejo o meu livro.',
    });
  });

  // D2: OWN is the emphasis on top of the link, and in Japanese it follows 自分 as it follows any named
  // owner — 自分自身の, never 自分の自分の.
  test('with OWN is the emphatic possessive, and 自分自身の in Japanese', () => {
    expect(sees(np('CAT'), np('BOOK', { possessor: link, possessorOwn: true }))).toEqual({
      en: 'the cat sees its own book.', it: 'il gatto vede il suo proprio libro.', fr: 'le chat voit son propre livre.',
      de: 'der Kater sieht sein eigenes Buch.', es: 'el gato ve su propio libro.', ja: '猫は自分自身の本を見ます。',
      pt: 'o gato vê o seu próprio livro.',
    });
    // OWN on a pronominal possessor is untouched: 自分の replaces the pronoun (C37).
    expect(sees(np('CAT'), np('BOOK', { possessor: { kind: 'pronominal', person: '3', number: 'singular' }, possessorOwn: true })))
      .toMatchObject({ ja: '猫は自分の本を見ます。' });
  });

  test('reaches through a possessor chain, a complement and a command', () => {
    expect(sees(np('CAT'), np('BOOK', { possessor: np('MOTHER', { possessor: link }) }))).toMatchObject({
      en: "the cat sees its mother's book.", de: 'der Kater sieht das Buch seiner Mutter.', ja: '猫は自分の母の本を見ます。',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { direction: { phrase: np('HOUSE', { possessor: link }) } } })))
      .toMatchObject({ en: 'the cat runs to its house.', fr: 'le chat court à sa maison.', ja: '猫は自分の家へ走ります。' });
    // A command's subject is its addressee.
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'SEE', { directObject: np('BOOK', { possessor: link }) }), imperative: true }))
      .toMatchObject({ en: 'see your book.', it: 'vedi il tuo libro.', ja: '自分の本を見てください。' });
  });

  // A clause's subject is its own: a relative clause's link names the relative's subject, which for a
  // subject relative is the head it modifies.
  test('names the relative clause\'s own subject inside one', () => {
    const man = np('MAN', { relative: { verbPhrase: { verb: 'SEE' }, directObject: np('MOTHER', { possessor: link }) } });
    expect(sayAll(clause(man, 'RUN'))).toMatchObject({
      en: 'the man who sees his mother runs.', de: 'der Mann, der seine Mutter sieht, läuft.',
      ja: '自分のお母さんを見る男は走ります。',
    });
  });
});

/** A phrase whose possessor is the link. */
const L = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { possessor: link, ...extra });

describe('a linked possessor in its case, number and article', () => {
  // German declines the possessive for the possessed head's own case, and reads the subject's gender
  // for the stem: seinen Hund (accusative), mit seinem Hund (dative), die Frau … ihren / in ihrem.
  test('declines in German for the case its phrase stands in', () => {
    expect(sees(np('MAN'), L('DOG'))).toEqual({
      en: 'the man sees his dog.', it: "l'uomo vede il suo cane.", fr: "l'homme voit son chien.",
      de: 'der Mann sieht seinen Hund.', es: 'el hombre ve su perro.', ja: '男は自分の犬を見ます。',
      pt: 'o homem vê o seu cão.',
    });
    expect(sees(np('WOMAN', { gender: 'fem' }), L('DOG'))).toEqual({
      en: 'the woman sees her dog.', it: 'la donna vede il suo cane.', fr: 'la femme voit son chien.',
      de: 'die Frau sieht ihren Hund.', es: 'la mujer ve su perro.', ja: '女は自分の犬を見ます。',
      pt: 'a mulher vê o seu cão.',
    });
    expect(sayAll(clause(np('MAN'), 'RUN', { complements: { comitative: { phrase: L('DOG') } } }))).toEqual({
      en: 'the man runs with his dog.', it: "l'uomo corre con il suo cane.", fr: "l'homme court avec son chien.",
      de: 'der Mann läuft mit seinem Hund.', es: 'el hombre corre con su perro.', ja: '男は自分の犬と走ります。',
      pt: 'o homem corre com o seu cão.',
    });
    expect(sayAll(clause(np('MAN'), 'RUN', { complements: { comitative: { phrase: L('MOTHER') } } }))).toEqual({
      en: 'the man runs with his mother.', it: "l'uomo corre con sua madre.", fr: "l'homme court avec sa mère.",
      de: 'der Mann läuft mit seiner Mutter.', es: 'el hombre corre con su madre.', ja: '男は自分のお母さんと走ります。',
      pt: 'o homem corre com a sua mãe.',
    });
    expect(sayAll(clause(np('WOMAN', { gender: 'fem' }), 'RUN', { complements: { locative: { phrase: L('HOUSE') } } }))).toEqual({
      en: 'the woman runs in her house.', it: 'la donna corre nella sua casa.', fr: 'la femme court dans sa maison.',
      de: 'die Frau läuft in ihrem Haus.', es: 'la mujer corre en su casa.', ja: '女は自分の家で走ります。',
      pt: 'a mulher corre na sua casa.',
    });
  });

  // The Romance possessive agrees with what is owned, not with the owner: i suoi libri, ses livres.
  test('agrees with a plural head, and takes its article where Romance writes one', () => {
    expect(sees(np('CAT'), L('BOOK', { number: 'plural' }))).toEqual({
      en: 'the cat sees its books.', it: 'il gatto vede i suoi libri.', fr: 'le chat voit ses livres.',
      de: 'der Kater sieht seine Bücher.', es: 'el gato ve sus libros.', ja: '猫は自分の本を見ます。',
      pt: 'o gato vê os seus livros.',
    });
    // A plural kin noun takes back the article a singular one drops in Italian.
    expect(sees(np('MAN'), L('SISTER', { number: 'plural' }))).toEqual({
      en: 'the man sees his sisters.', it: "l'uomo vede le sue sorelle.", fr: "l'homme voit ses sœurs.",
      de: 'der Mann sieht seine Schwestern.', es: 'el hombre ve a sus hermanas.', ja: '男は自分の姉妹を見ます。',
      pt: 'o homem vê as suas irmãs.',
    });
    // So does loro, the plural owner's possessive.
    expect(sees(np('BOY', { number: 'plural' }), L('MOTHER'))).toEqual({
      en: 'the boys see their mother.', it: 'i ragazzi vedono la loro madre.', fr: 'les garçons voient leur mère.',
      de: 'die Jungen sehen ihre Mutter.', es: 'los niños ven a su madre.', ja: '男の子は自分のお母さんを見ます。',
      pt: 'os meninos veem a sua mãe.',
    });
    // …and so does an adjective on the kin noun.
    expect(sees(np('MAN'), L('MOTHER', { adjectives: ['OLD'] }))).toEqual({
      en: 'the man sees his old mother.', it: "l'uomo vede la sua vecchia madre.", fr: "l'homme voit sa vieille mère.",
      de: 'der Mann sieht seine alte Mutter.', es: 'el hombre ve a su madre vieja.', ja: '男は自分の古いお母さんを見ます。',
      pt: 'o homem vê a sua mãe velha.',
    });
  });

  // French writes son, not sa, before a vowel-initial feminine: son aile, son amie.
  test('is son in French before a vowel-initial feminine', () => {
    expect(sees(np('CAT'), L('WING'))).toEqual({
      en: 'the cat sees its wing.', it: 'il gatto vede la sua ala.', fr: 'le chat voit son aile.',
      de: 'der Kater sieht seinen Flügel.', es: 'el gato ve su ala.', ja: '猫は自分の翼を見ます。',
      pt: 'o gato vê a sua asa.',
    });
    expect(sees(np('MAN'), L('FRIEND', { gender: 'fem' }))).toEqual({
      en: 'the man sees his friend.', it: "l'uomo vede la sua amica.", fr: "l'homme voit son amie.",
      de: 'der Mann sieht seine Freundin.', es: 'el hombre ve a su amiga.', ja: '男は自分の友達を見ます。',
      pt: 'o homem vê a sua amiga.',
    });
  });
});

describe('a linked possessor under a pronoun subject', () => {
  test('takes the pronoun\'s person and number', () => {
    expect(sees(np('FIRST_PERSON', { number: 'plural' }), L('BOOK'))).toEqual({
      en: 'we see our book.', it: 'vediamo il nostro libro.', fr: 'nous voyons notre livre.',
      de: 'wir sehen unser Buch.', es: 'vemos nuestro libro.', ja: '私たちは自分の本を見ます。',
      pt: 'vemos o nosso livro.',
    });
    expect(sees(np('SECOND_PERSON'), L('BOOK'))).toEqual({
      en: 'you see your book.', it: 'vedi il tuo libro.', fr: 'tu vois ton livre.', de: 'du siehst dein Buch.',
      es: 'ves tu libro.', ja: 'あなたは自分の本を見ます。', pt: 'vê o seu livro.',
    });
    expect(sees(np('SECOND_PERSON', { number: 'plural' }), L('BOOK'))).toEqual({
      en: 'you see your book.', it: 'vedete il vostro libro.', fr: 'vous voyez votre livre.', de: 'ihr seht euer Buch.',
      es: 'veis vuestro libro.', ja: 'あなたたちは自分の本を見ます。', pt: 'veem o seu livro.',
    });
    expect(sees(np('THIRD_PERSON', { number: 'plural' }), L('BOOK'))).toEqual({
      en: 'they see their book.', it: 'vedono il loro libro.', fr: 'ils voient leur livre.', de: 'sie sehen ihr Buch.',
      es: 'ven su libro.', ja: '彼らは自分の本を見ます。', pt: 'veem o seu livro.',
    });
  });

  // A 3rd-person pronoun names its gender, so English and German have it to read.
  test('takes a 3rd-person pronoun\'s gender', () => {
    expect(sees(np('THIRD_PERSON', { gender: 'fem' }), L('BOOK'))).toEqual({
      en: 'she sees her book.', it: 'vede il suo libro.', fr: 'elle voit son livre.', de: 'sie sieht ihr Buch.',
      es: 've su libro.', ja: '彼女は自分の本を見ます。', pt: 'vê o seu livro.',
    });
  });
});

describe('a linked possessor under negation and questions', () => {
  test('is unchanged by a negated verb and a yes/no question', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { verbPhrase: { negative: true }, directObject: L('BOOK') }))).toEqual({
      en: 'the cat does not see its book.', it: 'il gatto non vede il suo libro.', fr: 'le chat ne voit pas son livre.',
      de: 'der Kater sieht sein Buch nicht.', es: 'el gato no ve su libro.', ja: '猫は自分の本を見ません。',
      pt: 'o gato não vê o seu livro.',
    });
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: L('BOOK'), interrogative: true }))).toEqual({
      en: 'does the cat see its book?', it: 'il gatto vede il suo libro?', fr: 'est-ce que le chat voit son livre\u00a0?',
      de: 'sieht der Kater sein Buch?', es: '¿el gato ve su libro?', ja: '猫は自分の本を見ますか？',
      pt: 'o gato vê o seu livro?',
    });
  });

  // The asked subject is a person of unknown sex, so the unmarked his, as for PERSON.
  test('binds to an asked subject', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: L('BOOK'), questionRole: 'subject', questionAnimate: true }))).toEqual({
      en: 'who sees his book?', it: 'chi vede il suo libro?', fr: 'qui voit son livre\u00a0?', de: 'wer sieht sein Buch?',
      es: '¿quién ve su libro?', ja: '誰が自分の本を見ますか？', pt: 'quem vê o seu livro?',
    });
  });
});

describe('a linked possessor in a subordinate clause binds to that clause\'s own subject', () => {
  const woman = np('WOMAN', { gender: 'fem' });

  test('in a content clause', () => {
    expect(sayAll(clause(np('MAN'), 'SAY', { contentObject: { subject: woman, verbPhrase: { verb: 'SEE' }, directObject: L('BOOK') } }))).toEqual({
      en: 'the man says that the woman sees her book.', it: "l'uomo dice che la donna vede il suo libro.",
      fr: "l'homme dit que la femme voit son livre.", de: 'der Mann sagt, dass die Frau ihr Buch sieht.',
      es: 'el hombre dice que la mujer ve su libro.', ja: '男は女が自分の本を見ると言います。',
      pt: 'o homem diz que a mulher vê o seu livro.',
    });
  });

  // An infinitive's subject is its controller: the object of CAUSE, the subject of DESIRE and of the purpose.
  test('in an infinitive, a purpose and a causative, bound to the controller', () => {
    expect(sayAll({
      subject: woman, verbPhrase: { verb: 'CAUSE_VERB' }, directObject: np('MAN'),
      infinitiveComplement: { verbPhrase: { verb: 'SEE' }, directObject: L('BOOK'), control: 'object' },
    })).toEqual({
      en: 'the woman causes the man to see his book.', it: "la donna induce l'uomo a vedere il suo libro.",
      fr: "la femme induit l'homme à voir son livre.", de: 'die Frau veranlasst den Mann, sein Buch zu sehen.',
      es: 'la mujer induce al hombre a ver su libro.', ja: '女は男が自分の本を見るようにします。',
      pt: 'a mulher induz o homem a ver o seu livro.',
    });
    expect(sayAll(clause(np('MAN'), 'RUN', { purpose: { verbPhrase: { verb: 'SEE' }, directObject: L('MOTHER') } }))).toEqual({
      en: 'the man runs to see his mother.', it: "l'uomo corre per vedere sua madre.", fr: "l'homme court pour voir sa mère.",
      de: 'der Mann läuft, um seine Mutter zu sehen.', es: 'el hombre corre para ver a su madre.',
      ja: '男は自分のお母さんを見るために走ります。', pt: 'o homem corre para ver a sua mãe.',
    });
    expect(sayAll(clause(woman, 'DESIRE', { infinitiveComplement: { verbPhrase: { verb: 'SEE' }, directObject: L('MOTHER') } }))).toEqual({
      en: 'the woman desires to see her mother.', it: 'la donna desidera vedere sua madre.', fr: 'la femme désire voir sa mère.',
      de: 'die Frau wünscht, ihre Mutter zu sehen.', es: 'la mujer desea ver a su madre.',
      ja: '女は自分のお母さんを見ることを望んでいます。', pt: 'a mulher deseja ver a sua mãe.',
    });
  });

  test('in a coordinated clause', () => {
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), coordination: { conjunction: 'and', clause: clause(woman, 'SEE', { directObject: L('BOOK') }) } })).toEqual({
      en: 'the cat runs, and the woman sees her book.', it: 'il gatto corre, e la donna vede il suo libro.',
      fr: 'le chat court, et la femme voit son livre.', de: 'der Kater läuft, und die Frau sieht ihr Buch.',
      es: 'el gato corre, y la mujer ve su libro.', ja: '猫は走ります。そして、女は自分の本を見ます。',
      pt: 'o gato corre, e a mulher vê o seu livro.',
    });
  });

  // An object relative's subject is its own (the man), a subject relative's is its head (the cat).
  test('in a relative clause, to the relative\'s subject', () => {
    const cat = np('CAT', { relative: { headRole: 'directObject', subject: np('MAN'), verbPhrase: { verb: 'SEE' }, complements: { locative: { phrase: L('HOUSE') } } } });
    expect(sayAll(clause(cat, 'RUN'))).toEqual({
      en: 'the cat that the man sees in his house runs.', it: "il gatto che l'uomo vede nella sua casa corre.",
      fr: "le chat que l'homme voit dans sa maison court.", de: 'der Kater, den der Mann in seinem Haus sieht, läuft.',
      es: 'el gato que el hombre ve en su casa corre.', ja: '男が自分の家で見る猫は走ります。',
      pt: 'o gato que o homem vê na sua casa corre.',
    });
    expect(sees(np('MAN'), np('CAT', { relative: { verbPhrase: { verb: 'SEE' }, directObject: L('BOOK') } }))).toEqual({
      en: 'the man sees the cat that sees its book.', it: "l'uomo vede il gatto che vede il suo libro.",
      fr: "l'homme voit le chat qui voit son livre.", de: 'der Mann sieht den Kater, der sein Buch sieht.',
      es: 'el hombre ve el gato que ve su libro.', ja: '男は自分の本を見る猫を見ます。',
      pt: 'o homem vê o gato que vê o seu livro.',
    });
  });
});

// The standards of comparison are the clause's own phrases, so a link in one binds to its subject.
describe('a linked possessor in a standard of comparison', () => {
  test('in an attributive adjective\'s standard', () => {
    const bigger = np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [L('DOG')] });
    expect(sees(np('MAN'), bigger)).toEqual({
      en: 'the man sees a bigger cat than his dog.', it: "l'uomo vede un gatto più grande del suo cane.",
      fr: "l'homme voit un chat plus grand que son chien.", de: 'der Mann sieht einen größeren Kater als seinen Hund.',
      es: 'el hombre ve un gato más grande que su perro.', ja: '男は自分の犬より大きい猫を見ます。',
      pt: 'o homem vê um gato maior do que o seu cão.',
    });
  });

  test('in a predicative head\'s standard', () => {
    const bigger = np('BIG', { headDegree: 'more', headStandard: L('DOG') });
    expect(sayAll(clause(np('MAN'), 'BE', { complements: { predicative: { phrase: bigger } } }))).toEqual({
      en: 'the man is bigger than his dog.', it: "l'uomo è più grande del suo cane.", fr: "l'homme est plus grand que son chien.",
      de: 'der Mann ist größer als sein Hund.', es: 'el hombre es más grande que su perro.', ja: '男は自分の犬より大きいです。',
      pt: 'o homem é maior do que o seu cão.',
    });
  });
});

describe('a possessor linked to a subject that is not there to name', () => {
  // The subject cannot hold a link to itself, and a verbless period is nothing but its subject.
  test('is refused by name inside the subject, not left to crash', () => {
    expect(() => sayAll(clause(np('BOOK', { possessor: link }), 'RUN')))
      .toThrow('a coreferent possessor points at the subject, so it cannot stand in the subject itself (P11-E2)');
    expect(() => sayAll({ subject: np('BOOK', { possessor: link }) }))
      .toThrow('a coreferent possessor points at the subject, so it cannot stand in the subject itself (P11-E2)');
    expect(() => sayAll(clause(np('BOOK', { possessor: np('MOTHER', { possessor: link }) }), 'RUN'))).toThrow(/P11-E2/);
  });

  test('is refused inside a relative clause\'s own subject', () => {
    const cat = np('CAT', { relative: { headRole: 'directObject', subject: np('DOG', { possessor: link }), verbPhrase: { verb: 'SEE' } } });
    expect(() => sayAll(clause(cat, 'RUN'))).toThrow(/cannot stand in the subject itself/);
  });

  // A content clause's subject is the subject its own links name, so it cannot hold one either.
  test('is refused inside a content clause\'s own subject', () => {
    expect(() => sayAll(clause(np('MAN'), 'SAY', { contentObject: { subject: L('MOTHER'), verbPhrase: { verb: 'RUN' } } })))
      .toThrow(/cannot stand in the subject itself/);
  });

  // The vocative stands outside the clause, so no clause binds a link in it.
  test('is refused in the address', () => {
    expect(() => sayAll({ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, address: L('MOM') }))
      .toThrow('a coreferent possessor needs a clause whose subject it names, and this phrase stands in none (P11-E2)');
  });
});

// A293. `subjectBinding` takes English's gender from the subject's lexeme, and an English noun records
// none, so a person falls to the unmarked *his* unless the plan names a gender. That is the right
// default for a person of unknown sex (PERSON, FRIEND), but MOTHER, WOMAN, SISTER, DAUGHTER, WIFE and
// AUNT are female by meaning: "your mother sees his book" says she sees a man's. German, reading its
// grammatical feminine, already says "ihr Buch". The link is what brings it in: with a pronominal
// possessor the plan names the owner itself, and *his* is then its own pick.
describe('known bugs: english writes his for a possessor linked to a female subject whose english noun records no gender (A293)', () => {
  const her = (subject: NounPhrase) => sees(subject, np('BOOK', { possessor: link })).en;
  const you = { kind: 'pronominal', person: '2', number: 'singular' } as const;

  test('your mother', () => {
    expect(her(np('MOTHER', { possessor: you }))).toBe('your mother sees her book.');
  });

  test('the woman', () => {
    expect(her(np('WOMAN'))).toBe('the woman sees her book.');
  });

  test('the sister', () => {
    expect(her(np('SISTER'))).toBe('the sister sees her book.');
  });

  test('the daughter', () => {
    expect(her(np('DAUGHTER'))).toBe('the daughter sees her book.');
  });

  test('the wife', () => {
    expect(her(np('WIFE'))).toBe('the wife sees her book.');
  });

  test('the aunt', () => {
    expect(her(np('AUNT'))).toBe('the aunt sees her book.');
  });

  test('with OWN', () => {
    expect(sees(np('MOTHER'), np('BOOK', { possessor: link, possessorOwn: true })).en).toBe('the mother sees her own book.');
  });

  test('inside a relative clause on the subject', () => {
    const mother = np('MOTHER', { relative: { verbPhrase: { verb: 'SEE' }, directObject: np('BOOK', { possessor: link }) } });
    expect(sayAll(clause(mother, 'RUN')).en).toBe('the mother who sees her book runs.');
  });

  test('my mother, on her older sister', () => {
    const mine = { kind: 'pronominal', person: '1', number: 'singular' } as const;
    expect(sees(np('MOTHER', { possessor: mine }), np('SISTER', { adjectives: ['ELDER'], possessor: link })).en)
      .toBe('my mother sees her older sister.');
  });

  // The sex is the concept's (`sex`), recorded on every person noun that has one by meaning.
  test('the other female persons, a name, a complement, and the plan’s own gender first', () => {
    expect(her(np('GRANDMOTHER'))).toBe('the grandmother sees her book.');
    expect(her(np('GIRLFRIEND'))).toBe('the girlfriend sees her book.');
    expect(her(np('MOM'))).toBe('Mom sees her book.');
    expect(her(np('MARY'))).toBe('Mary sees her book.');
    expect(her(np('PETER'))).toBe('Peter sees his book.');
    expect(sayAll(clause(np('WOMAN'), 'RUN', { complements: { comitative: { phrase: np('DOG', { possessor: link }) } } })).en)
      .toBe('the woman runs with her dog.');
    // The plan's own gender still comes first.
    expect(her(np('WOMAN', { gender: 'masc' }))).toBe('the woman sees his book.');
    expect(her(np('DOG'))).toBe('the dog sees its book.');
  });

  test('regression: the other six, a gender the plan names, a man, a person of unknown sex, the plural and the pronominal possessor', () => {
    expect(sees(np('MOTHER', { possessor: you }), np('BOOK', { possessor: link }))).toMatchObject({
      it: 'tua madre vede il suo libro.', fr: 'ta mère voit son livre.', de: 'deine Mutter sieht ihr Buch.',
      es: 'tu madre ve su libro.', ja: 'あなたのお母さんは自分の本を見ます。', pt: 'a sua mãe vê o seu livro.',
    });
    expect(sees(np('MOTHER', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } }), np('SISTER', { adjectives: ['ELDER'], possessor: link })))
      .toMatchObject({
        it: 'mia madre vede la sua sorella maggiore.', fr: 'ma mère voit sa sœur aînée.', de: 'meine Mutter sieht ihre ältere Schwester.',
        es: 'mi madre ve a su hermana mayor.', ja: '母は自分の姉を見ます。', pt: 'a minha mãe vê a sua irmã mais velha.',
      });
    expect(her(np('WOMAN', { gender: 'fem' }))).toBe('the woman sees her book.');
    expect(her(np('FRIEND', { gender: 'fem' }))).toBe('the friend sees her book.');
    expect(her(np('MAN'))).toBe('the man sees his book.');
    expect(her(np('FATHER'))).toBe('the father sees his book.');
    // Not guessed: a person whose sex nothing records keeps the unmarked possessive.
    expect(her(np('PERSON'))).toBe('the person sees his book.');
    expect(her(np('MOTHER', { number: 'plural' }))).toBe('the mothers see their book.');
    // A pronominal possessor names its owner in the plan, so the link is not involved.
    const third = (gender?: 'fem') => sees(np('MOTHER'), np('BOOK', {
      possessor: { kind: 'pronominal', person: '3', number: 'singular', ...(gender ? { gender } : {}) },
    }));
    expect(third()).toMatchObject({ en: 'the mother sees his book.', de: 'die Mutter sieht sein Buch.' });
    expect(third('fem')).toMatchObject({ en: 'the mother sees her book.', de: 'die Mutter sieht ihr Buch.' });
  });
});

// A332. `subjectBinding` hands the engines the generic subject's agreement as an ordinary 3rd-person
// possessor, so English writes *his* after *one* and Italian *suo* after *si*, both someone else's.
// English says *one's*, and Italian's impersonal si binds only *proprio*. French, German and Japanese
// bind their ordinary possessive, and Spanish and Portuguese se binds *su* / *seu* as well. Only the
// link knows the owner is the generic subject: a pronominal possessor names a 3rd person of its own.
describe('known bugs: english and italian write his / suo for a possessor linked to the generic subject (A332)', () => {
  const one = np('GENERIC_PERSON');

  test('the link', () => {
    expect(sees(one, L('BOOK'))).toEqual({
      en: "one sees one's book.", it: 'si vede il proprio libro.', fr: 'on voit son livre.', de: 'man sieht sein Buch.',
      es: 'se ve su libro.', ja: '人は自分の本を見ます。', pt: 'se vê o seu livro.',
    });
  });

  // proprio is already the emphasis, so Italian does not stack a second one.
  test('with OWN', () => {
    expect(sees(one, L('BOOK', { possessorOwn: true }))).toEqual({
      en: "one sees one's own book.", it: 'si vede il proprio libro.', fr: 'on voit son propre livre.',
      de: 'man sieht sein eigenes Buch.', es: 'se ve su propio libro.', ja: '人は自分自身の本を見ます。',
      pt: 'se vê o seu próprio livro.',
    });
  });

  // A kin noun keeps its article before proprio, as it does before an adjective.
  test('on a kin noun', () => {
    expect(sees(one, L('MOTHER'))).toEqual({
      en: "one sees one's mother.", it: 'si vede la propria madre.', fr: 'on voit sa mère.', de: 'man sieht seine Mutter.',
      es: 'se ve a su madre.', ja: '人は自分のお母さんを見ます。', pt: 'se vê a sua mãe.',
    });
  });

  test('in a complement', () => {
    expect(sayAll(clause(one, 'RUN', { complements: { comitative: { phrase: L('DOG') } } }))).toEqual({
      en: "one runs with one's dog.", it: 'si corre con il proprio cane.', fr: 'on court avec son chien.',
      de: 'man läuft mit seinem Hund.', es: 'se corre con su perro.', ja: '人は自分の犬と走ります。',
      pt: 'se corre com o seu cão.',
    });
  });

  // proprio agrees with its head as suo does, and one's stands wherever his stood.
  test('agreement, a possessor chain, an indefinite head and OWN on a kin noun', () => {
    const at = (object: NounPhrase) => sees(one, object);
    expect(at(L('HOUSE'))).toMatchObject({ en: "one sees one's house.", it: 'si vede la propria casa.' });
    expect(at(L('BOOK', { number: 'plural' }))).toMatchObject({ en: "one sees one's books.", it: 'si vedono i propri libri.' });
    expect(at(np('BOOK', { possessor: L('MOTHER') }))).toMatchObject({
      en: "one sees one's mother's book.", it: 'si vede il libro della propria madre.',
    });
    // The independent form, after a head that keeps its own article (A277).
    expect(at(L('FRIEND', { definiteness: 'indefinite' }))).toMatchObject({
      en: "one sees a friend of one's own.", it: 'si vede un proprio amico.',
    });
    expect(at(L('MOTHER', { possessorOwn: true }))).toMatchObject({
      en: "one sees one's own mother.", it: 'si vede la propria madre.', fr: 'on voit sa propre mère.',
      de: 'man sieht seine eigene Mutter.',
    });
  });

  test('regression: the other five, the pronominal possessor and the subject question', () => {
    expect(sees(one, L('BOOK'))).toMatchObject({
      fr: 'on voit son livre.', de: 'man sieht sein Buch.', es: 'se ve su libro.', ja: '人は自分の本を見ます。',
      pt: 'se vê o seu livro.',
    });
    expect(sees(one, L('BOOK', { possessorOwn: true }))).toMatchObject({
      fr: 'on voit son propre livre.', de: 'man sieht sein eigenes Buch.', es: 'se ve su propio libro.',
      ja: '人は自分自身の本を見ます。', pt: 'se vê o seu próprio livro.',
    });
    // A pronominal possessor names a 3rd person of its own, not the generic subject.
    expect(sees(one, np('BOOK', { possessor: { kind: 'pronominal', person: '3', number: 'singular' } }))).toEqual({
      en: 'one sees his book.', it: 'si vede il suo libro.', fr: 'on voit son livre.', de: 'man sieht sein Buch.',
      es: 'se ve su libro.', ja: '人は彼の本を見ます。', pt: 'se vê o seu livro.',
    });
    // The wh-word that stands in for an asked subject is not the generic one.
    expect(sayAll(clause(one, 'SEE', { directObject: L('BOOK'), questionRole: 'subject', questionAnimate: true })))
      .toMatchObject({ en: 'who sees his book?', it: 'chi vede il suo libro?' });
  });
});
