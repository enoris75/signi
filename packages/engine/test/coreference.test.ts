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
});
