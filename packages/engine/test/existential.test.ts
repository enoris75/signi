import { describe, expect, test } from 'vitest';
import type { NounElement, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll, translateAll } from './harness.js';

// The existential — "there is a cat in the house" (PhrasePlan.existential, P09-E6 D5). The plan's
// subject is the pivot, the thing there is, and its verb is BE; the translator resolves it as the
// plain clause each language says it with, the pivot the object of the existential verb (see
// `existentialPlan`): en *there is / there are* and it *c'è / ci sono*, agreeing with the pivot; fr
// *il y a*, de *es gibt* with the accusative, es *hay* and pt *há*, all four invariable; ja the pivot
// marked が before いる / ある by its animacy, any place ahead of it with に.
const there = (pivot: NounElement, extra: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> & {
  verbPhrase?: Partial<VerbPhrase>;
} = {}): PhrasePlan & { verbPhrase: VerbPhrase } => ({ ...clause(pivot, 'BE', extra), verbPhrase: { verb: 'BE', ...extra.verbPhrase }, existential: true });
const aCat = np('CAT', { definiteness: 'indefinite' });
const cats = np('CAT', { definiteness: 'indefinite', number: 'plural' });
const aBook = np('BOOK', { definiteness: 'indefinite' });
const inTheHouse = { locative: { phrase: np('HOUSE') } };

describe('the existential: the pivot', () => {
  test('a singular pivot: there is a cat', () => {
    expect(sayAll(there(aCat))).toEqual({
      en: 'there is a cat.',
      it: "c'è un gatto.",
      fr: 'il y a un chat.',
      de: 'es gibt einen Kater.',
      es: 'hay un gato.',
      ja: '猫がいます。',
      pt: 'há um gato.',
    });
  });

  test('a plural pivot: en and it agree with it, the other five do not', () => {
    expect(sayAll(there(cats, { complements: inTheHouse }))).toEqual({
      en: 'there are cats in the house.',
      it: 'ci sono gatti nella casa.',
      fr: 'il y a des chats dans la maison.',
      de: 'es gibt Kater im Haus.',
      es: 'hay unos gatos en la casa.',
      ja: '家に猫がいます。',
      pt: 'há uns gatos na casa.',
    });
    // A bare plural pivot is the article-less one Spanish and Portuguese prefer.
    expect(sayAll(there(np('CAT', { definiteness: 'bare', number: 'plural' }), { complements: inTheHouse }))).toMatchObject({
      en: 'there are cats in the house.',
      es: 'hay gatos en la casa.',
      pt: 'há gatos na casa.',
    });
  });

  test('a coordinated pivot is plural: there are a cat and a dog', () => {
    expect(sayAll(there({ conjuncts: [aCat, np('DOG', { definiteness: 'indefinite' })], conjunction: 'and' }))).toEqual({
      en: 'there are a cat and a dog.',
      it: 'ci sono un gatto e un cane.',
      fr: 'il y a un chat et un chien.',
      de: 'es gibt einen Kater und einen Hund.',
      es: 'hay un gato y un perro.',
      ja: '猫と犬がいます。',
      pt: 'há um gato e um cão.',
    });
  });

  test('an "or" pivot agrees with its first conjunct, the one nearest the verb', () => {
    const or: NounElement = { conjuncts: [aCat, np('DOG', { definiteness: 'indefinite', number: 'plural' })], conjunction: 'or' };
    expect(sayAll(there(or))).toMatchObject({ en: 'there is a cat or dogs.', it: "c'è un gatto o cani." });
  });

  test('an inanimate pivot takes ある in Japanese, and changes nothing elsewhere', () => {
    expect(sayAll(there(aBook, { complements: inTheHouse }))).toEqual({
      en: 'there is a book in the house.',
      it: "c'è un libro nella casa.",
      fr: 'il y a un livre dans la maison.',
      de: 'es gibt ein Buch im Haus.',
      es: 'hay un libro en la casa.',
      ja: '家に本があります。',
      pt: 'há um livro na casa.',
    });
  });

  test('something is a thing, so Japanese says ある of it', () => {
    expect(sayAll(there(np('SOMETHING'), { complements: inTheHouse }))).toEqual({
      en: 'there is something in the house.',
      it: "c'è qualcosa nella casa.",
      fr: 'il y a quelque chose dans la maison.',
      de: 'es gibt etwas im Haus.',
      es: 'hay algo en la casa.',
      ja: '家に何かがあります。',
      pt: 'há algo na casa.',
    });
  });

  test('a definite pivot renders as the plan gives it', () => {
    expect(sayAll(there(np('CAT')))).toMatchObject({ en: 'there is the cat.', it: "c'è il gatto.", de: 'es gibt den Kater.' });
  });

  test('the plan\'s direct object means nothing and is dropped', () => {
    expect(sayAll(there(aCat, { directObject: np('DOG') }))).toEqual(sayAll(there(aCat)));
  });
});

describe('the existential: complements, tense and aspect', () => {
  test('a locative follows the pivot, and precedes it in Japanese', () => {
    expect(sayAll(there(aCat, { complements: inTheHouse }))).toEqual({
      en: 'there is a cat in the house.',
      it: "c'è un gatto nella casa.",
      fr: 'il y a un chat dans la maison.',
      de: 'es gibt einen Kater im Haus.',
      es: 'hay un gato en la casa.',
      ja: '家に猫がいます。',
      pt: 'há um gato na casa.',
    });
  });

  test('a temporal complement renders as on any clause', () => {
    expect(sayAll(there(aCat, { complements: { temporal: { phrase: np('DAY', { definiteness: 'this' }) } } }))).toMatchObject({
      en: 'there is a cat on this day.',
      de: 'es gibt einen Kater an diesem Tag.',
      ja: 'この日に猫がいます。',
    });
  });

  test('the past: a state, so the Romance imperfect', () => {
    expect(sayAll(there(aCat, { verbPhrase: { tense: 'past' }, complements: inTheHouse }))).toEqual({
      en: 'there was a cat in the house.',
      it: "c'era un gatto nella casa.",
      fr: 'il y avait un chat dans la maison.',
      de: 'es gab einen Kater im Haus.',
      es: 'había un gato en la casa.',
      ja: '家に猫がいました。',
      pt: 'havia um gato na casa.',
    });
  });

  test('the future and the resultative', () => {
    expect(sayAll(there(aCat, { verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'there will be a cat.',
      it: 'ci sarà un gatto.',
      fr: 'il y aura un chat.',
      de: 'es wird einen Kater geben.',
      es: 'habrá un gato.',
      ja: '猫がいます。',
      pt: 'haverá um gato.',
    });
    expect(sayAll(there(aCat, { verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'there has been a cat.',
      it: "c'è stato un gatto.",
      fr: 'il y a eu un chat.',
      de: 'es hat einen Kater gegeben.',
      es: 'ha habido un gato.',
      ja: '猫がいました。',
      pt: 'houve um gato.',
    });
  });

  test('a modal governs the existential verb\'s infinitive', () => {
    expect(sayAll(there(aCat, { verbPhrase: { modals: ['CAN'] } }))).toEqual({
      en: 'there can be a cat.',
      it: 'ci può essere un gatto.',
      fr: 'il peut y avoir un chat.',
      de: 'es kann einen Kater geben.',
      es: 'puede haber un gato.',
      ja: '猫がいることができます。',
      pt: 'pode haver um gato.',
    });
  });
});

describe('the existential: negation', () => {
  test('there is no cat', () => {
    expect(sayAll(there(aCat, { verbPhrase: { negative: true } }))).toEqual({
      en: 'there is no cat.',
      it: "non c'è un gatto.",
      fr: "il n'y a pas de chat.",
      de: 'es gibt keinen Kater.',
      es: 'no hay un gato.',
      ja: '猫がいません。',
      pt: 'não há um gato.',
    });
  });

  test('there are no cats', () => {
    expect(sayAll(there(cats, { verbPhrase: { negative: true } }))).toEqual({
      en: 'there are no cats.',
      it: 'non ci sono gatti.',
      fr: "il n'y a pas de chats.",
      de: 'es gibt keine Kater.',
      es: 'no hay unos gatos.',
      ja: '猫がいません。',
      pt: 'não há uns gatos.',
    });
  });

  test('a "no" pivot negates on its own, and is not negated twice', () => {
    const expected = {
      en: 'there is no cat.',
      it: "non c'è nessun gatto.",
      fr: "il n'y a aucun chat.",
      de: 'es gibt keinen Kater.',
      es: 'no hay ningún gato.',
      ja: 'どの猫もいません。',
      pt: 'não há nenhum gato.',
    };
    const noCat = np('CAT', { definiteness: 'no' });
    expect(sayAll(there(noCat))).toEqual(expected);
    expect(sayAll(there(noCat, { verbPhrase: { negative: true } }))).toEqual(expected);
  });

  test('something turns into nothing', () => {
    expect(sayAll(there(np('SOMETHING'), { verbPhrase: { negative: true } }))).toEqual({
      en: 'there is not anything.',
      it: "non c'è niente.",
      fr: "il n'y a rien.",
      de: 'es gibt nichts.',
      es: 'no hay nada.',
      ja: '何もありません。',
      pt: 'não há nada.',
    });
  });

  test('under a modal English keeps "not" on the group, as any modal clause does', () => {
    expect(sayAll(there(aCat, { verbPhrase: { negative: true, modals: ['CAN'] } }))).toMatchObject({
      en: 'there can not be a cat.',
      fr: 'il peut ne pas y avoir de chat.',
      de: 'es kann keinen Kater geben.',
    });
  });
});

describe('the existential: questions', () => {
  test('is there a cat?', () => {
    expect(sayAll(there(aCat, { interrogative: true }))).toEqual({
      en: 'is there a cat?',
      it: "c'è un gatto?",
      fr: "est-ce qu'il y a un chat ?",
      de: 'gibt es einen Kater?',
      es: '¿hay un gato?',
      ja: '猫がいますか？',
      pt: 'há um gato?',
    });
  });

  test('was there a cat in the house?', () => {
    expect(sayAll(there(aCat, { interrogative: true, verbPhrase: { tense: 'past' }, complements: inTheHouse }))).toEqual({
      en: 'was there a cat in the house?',
      it: "c'era un gatto nella casa?",
      fr: "est-ce qu'il y avait un chat dans la maison ?",
      de: 'gab es einen Kater im Haus?',
      es: '¿había un gato en la casa?',
      ja: '家に猫がいましたか？',
      pt: 'havia um gato na casa?',
    });
  });

  test('a negative question', () => {
    expect(sayAll(there(aCat, { interrogative: true, verbPhrase: { negative: true } }))).toMatchObject({
      en: 'is there no cat?',
      fr: "est-ce qu'il n'y a pas de chat ?",
      de: 'gibt es keinen Kater?',
    });
  });
});

describe('the existential inside other clauses', () => {
  test('an object clause: the man says that there is a cat', () => {
    expect(sayAll(clause(np('MAN'), 'SAY', { contentObject: there(aCat) }))).toEqual({
      en: 'the man says that there is a cat.',
      it: "l'uomo dice che c'è un gatto.",
      fr: "l'homme dit qu'il y a un chat.",
      de: 'der Mann sagt, dass es einen Kater gibt.',
      es: 'el hombre dice que hay un gato.',
      ja: '男は猫がいると言います。',
      pt: 'o homem diz que há um gato.',
    });
  });

  test('the subjunctive a negated belief governs', () => {
    expect(sayAll(clause(np('MAN'), 'BELIEVE', { verbPhrase: { negative: true }, contentObject: there(aCat) }))).toMatchObject({
      it: "l'uomo non crede che ci sia un gatto.",
      fr: "l'homme ne croit pas qu'il y ait un chat.",
      es: 'el hombre no cree que haya un gato.',
      pt: 'o homem não acredita que haja um gato.',
    });
  });

  test('coordination: there is a cat in the house, and the dog runs', () => {
    expect(sayAll({ ...there(aCat, { complements: inTheHouse }), coordination: { conjunction: 'and', clause: clause(np('DOG'), 'RUN') } }))
      .toEqual({
        en: 'there is a cat in the house, and the dog runs.',
        it: "c'è un gatto nella casa, e il cane corre.",
        fr: 'il y a un chat dans la maison, et le chien court.',
        de: 'es gibt einen Kater im Haus, und der Hund läuft.',
        es: 'hay un gato en la casa, y el perro corre.',
        ja: '家に猫がいます。そして、犬は走ります。',
        pt: 'há um gato na casa, e o cão corre.',
      });
  });

  test('a condition and an adverbial clause', () => {
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: there(aCat, { complements: inTheHouse }) })).toMatchObject({
      it: 'se ci fosse un gatto nella casa, il cane correrebbe.',
      fr: "s'il y avait un chat dans la maison, le chien courrait.",
      es: 'si hubiera un gato en la casa, el perro correría.',
      ja: 'もし家に猫がいたら、犬は走ります。',
      pt: 'se houvesse um gato na casa, o cão correria.',
    });
    expect(sayAll(clause(np('DOG'), 'RUN', { adverbialClause: { conjunction: 'when', clause: there(aCat, { complements: inTheHouse }) } })))
      .toMatchObject({
        en: 'the dog runs when there is a cat in the house.',
        de: 'der Hund läuft, wenn es einen Kater im Haus gibt.',
        ja: '犬は家に猫がいる時に走ります。',
      });
  });
});

describe('the existential: what is refused', () => {
  test('a verb other than BE, a wh-question, a command and a personal-pronoun pivot', () => {
    expect(() => translateAll({ ...there(aCat), verbPhrase: { verb: 'EAT' } })).toThrow(/BE/);
    expect(() => translateAll({ ...there(aCat), questionRole: 'locative' })).toThrow(/wh-question/);
    expect(() => translateAll({ ...there(aCat), imperative: true })).toThrow(/imperative/);
    expect(() => translateAll(there(np('FIRST_PERSON')))).toThrow(/pronoun/);
  });
});
