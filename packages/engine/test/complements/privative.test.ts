import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, NounElement } from '@signi/shared';
import { clause, np, say, sayAll } from '../harness.js';

const cutsWithout = (phrase: NounElement) =>
  sayAll(clause(np('WOMAN'), 'CUT', { complements: { instrumental: { phrase, negative: true } } }));

// The privative (P09-E2): the instrument denied, "cuts without the stick". It is no complement type —
// it is the `instrumental` with `Complement.negative`, as the denied cause is the cause with it. Unlike
// the cause it takes no negator: every language has a word for it standing where *with* would.
describe('the privative', () => {
  test('a definite instrument, denied', () => {
    expect(cutsWithout(np('STICK'))).toEqual({
      en: 'the woman cuts without the stick.',
      it: 'la donna taglia senza il bastone.',
      fr: 'la femme coupe sans le bâton.',
      de: 'die Frau schneidet ohne den Stock.', // ohne governs the accusative
      es: 'la mujer corta sin el palo.',
      pt: 'a mulher corta sem o pau.',
      ja: '女は棒なしで切ります。',
    });
  });

  test('an indefinite one', () => {
    expect(cutsWithout(np('STICK', { definiteness: 'indefinite' }))).toEqual({
      en: 'the woman cuts without a stick.',
      it: 'la donna taglia senza un bastone.',
      fr: 'la femme coupe sans un bâton.',
      de: 'die Frau schneidet ohne einen Stock.',
      es: 'la mujer corta sin un palo.',
      pt: 'a mulher corta sem um pau.',
      ja: '女は棒なしで切ります。',
    });
  });

  // French "sans" drops the plural indefinite and the partitive, as "de" does — where the
  // instrument's "avec" takes them ("avec des bâtons", A149).
  test('a bare plural, and a mass noun in French', () => {
    expect(cutsWithout(np('STICK', { number: 'plural', definiteness: 'bare' }))).toEqual({
      en: 'the woman cuts without sticks.',
      it: 'la donna taglia senza bastoni.',
      fr: 'la femme coupe sans bâtons.',
      de: 'die Frau schneidet ohne Stöcke.',
      es: 'la mujer corta sin palos.',
      pt: 'a mulher corta sem paus.',
      ja: '女は棒なしで切ります。',
    });
    expect(say(clause(np('WOMAN'), 'CUT', {
      complements: { instrumental: { phrase: np('WATER', { definiteness: 'some' }), negative: true } },
    }), 'fr')).toBe('la femme coupe sans eau.');
  });

  // The instrument's pronoun branch fuses the 1st and 2nd person with *con / com* ("conmigo"); the
  // privative fuses with nothing, and Italian reaches the pronoun through "di".
  test('a pronoun', () => {
    expect(cutsWithout(np('THIRD_PERSON'))).toEqual({
      en: 'the woman cuts without him.',
      it: 'la donna taglia senza di lui.',
      fr: 'la femme coupe sans lui.',
      de: 'die Frau schneidet ohne ihn.',
      es: 'la mujer corta sin él.',
      pt: 'a mulher corta sem ele.',
      ja: '女は彼なしで切ります。',
    });
    expect(cutsWithout(np('FIRST_PERSON'))).toMatchObject({
      it: 'la donna taglia senza di me.', es: 'la mujer corta sin mí.', pt: 'a mulher corta sem mim.',
      de: 'die Frau schneidet ohne mich.',
    });
  });

  test('a group repeats it before each conjunct where the language repeats the preposition', () => {
    expect(cutsWithout({ conjuncts: [np('STICK'), np('THIRD_PERSON')], conjunction: 'and' })).toMatchObject({
      en: 'the woman cuts without the stick and him.',
      it: 'la donna taglia senza il bastone e senza di lui.',
      de: 'die Frau schneidet ohne den Stock und ohne ihn.',
      ja: '女は棒と彼なしで切ります。',
    });
  });

  // The invariant `Complement.negative` documents for the cause: the complement is denied, not the
  // clause, so the verb stays positive and no negative concord fires — and a negated clause keeps its
  // own negation beside it.
  test('the clause itself stays positive', () => {
    expect(cutsWithout(np('STICK'))).toMatchObject({
      it: expect.not.stringContaining('non '), fr: expect.not.stringContaining(' ne '),
      es: expect.not.stringContaining(' no '), pt: expect.not.stringContaining('não'),
      de: expect.not.stringContaining('nicht'), ja: expect.stringMatching(/切ります。$/),
    });
    expect(sayAll(clause(np('WOMAN'), 'CUT', {
      verbPhrase: { negative: true },
      complements: { instrumental: { phrase: np('STICK'), negative: true } },
    }))).toEqual({
      en: 'the woman does not cut without the stick.',
      it: 'la donna non taglia senza il bastone.',
      fr: 'la femme ne coupe pas sans le bâton.',
      de: 'die Frau schneidet nicht ohne den Stock.',
      es: 'la mujer no corta sin el palo.',
      pt: 'a mulher não corta sem o pau.',
      ja: '女は棒なしで切りません。',
    });
  });

  test('an instrument not denied is the plain means, and no other complement reads the flag', () => {
    expect(sayAll(clause(np('WOMAN'), 'CUT', { complements: { instrumental: { phrase: np('STICK') } } })))
      .toMatchObject({ en: 'the woman cuts with the stick.', de: 'die Frau schneidet mit dem Stock.', ja: '女は棒で切ります。' });
    expect(sayAll(clause(np('CAT'), 'RUN', { complements: { comitative: { phrase: np('DOG'), negative: true } } })))
      .toMatchObject({ en: 'the cat runs with the dog.', it: 'il gatto corre con il cane.' });
  });

  test('beside an object and in a relative clause', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE'), complements: { instrumental: { phrase: np('STICK'), negative: true } },
    }))).toMatchObject({
      en: 'the cat eats the mouse without the stick.',
      de: 'der Kater frisst die Maus ohne den Stock.',
      ja: '猫は棒なしでネズミを食べます。',
    });
    expect(say(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'CUT' }, complements: { instrumental: { phrase: np('STICK'), negative: true } } },
    }), 'CRY'), 'de')).toBe('der Hund, der ohne den Stock schneidet, weint.');
  });

  // An act one does without. The Romance languages take the plain infinitive at either level, which
  // is the one form they give an act one is without; German takes the "ohne … zu" clause at the
  // process level, in the Nachfeld as "indem" is, and keeps its nominalised infinitive under an
  // accusative "ohne" at the concept level; Japanese takes the ない-form + で, and ことなしで.
  test.each<[AbstractionLevel, Record<string, string>]>([
    ['process', {
      en: 'the cat starts without choosing a word.',
      it: 'il gatto inizia senza scegliere una parola.',
      fr: 'le chat commence sans choisir un mot.',
      de: 'der Kater beginnt, ohne ein Wort zu wählen.',
      es: 'el gato empieza sin elegir una palabra.',
      pt: 'o gato começa sem escolher uma palavra.',
      ja: '猫は単語を選ばないで始めます。',
    }],
    ['concept', {
      en: 'the cat starts without the choosing of a word.',
      it: 'il gatto inizia senza scegliere una parola.',
      fr: 'le chat commence sans choisir un mot.',
      de: 'der Kater beginnt ohne das Wählen eines Wortes.',
      es: 'el gato empieza sin elegir una palabra.',
      pt: 'o gato começa sem escolher uma palavra.',
      ja: '猫は単語を選ぶことなしで始めます。',
    }],
  ])('an act denied, at the %s level', (level, expected) => {
    expect(sayAll(clause(np('CAT'), 'START', {
      complements: {
        instrumental: {
          phrase: np('WORD', { definiteness: 'indefinite' }),
          negative: true,
          action: { verb: 'CHOOSE' },
          specifiers: [{ kind: 'abstraction', value: level }],
        },
      },
    }))).toEqual(expected);
  });
});
