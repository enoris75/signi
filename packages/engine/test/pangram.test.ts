import { describe, expect, test } from 'vitest';
import type { Complement, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// "The quick brown fox of the boy who cried the wolf jumped over the lazy dog": the pangram, with a
// possessor that carries its own relative clause. Each part is pinned on its own elsewhere: two
// adjectives on one head (adjectives.test.ts), a possessor (possession.test.ts), a relative on a person
// (relative.test.ts) and the spatial complements (complements/locative, complements/route). This file
// pins the whole sentence, so a regression in how the parts combine shows up here.
//
// Italian and French are asserted only in the known-bugs blocks, because CRY_OUT's shouted alarm has
// no a / à (A124). So are German and French for the route, where "over" keeps its static form (A125).

const theBoyWhoCriedTheWolf = (wolf: Partial<NounPhrase> = {}): NounPhrase =>
  np('BOY', { relative: { verbPhrase: { verb: 'CRY_OUT', tense: 'past' }, directObject: np('WOLF', wolf) } });

const theQuickBrownFoxOf = (possessor: NounPhrase, extra: Partial<NounPhrase> = {}): NounPhrase =>
  np('FOX', { adjectives: ['QUICK', 'BROWN'], possessor, ...extra });

const overTheLazyDog: Complement = {
  phrase: np('DOG', { adjectives: ['LAZY'] }),
  specifiers: [{ kind: 'path', value: 'over' }],
};

// JUMP over the dog: as a place the jump happens at (locative), or as the path it crosses (route).
const jumpedOver = (subject: NounPhrase, as: 'locative' | 'route'): PhrasePlan =>
  clause(subject, 'JUMP', {
    verbPhrase: { tense: 'past' },
    complements: as === 'locative' ? { locative: overTheLazyDog } : { route: overTheLazyDog },
  });

const cried = (wolf: Partial<NounPhrase> = {}): PhrasePlan =>
  clause(np('BOY'), 'CRY_OUT', { verbPhrase: { tense: 'past' }, directObject: np('WOLF', wolf) });

describe('the quick brown fox of the boy who cried the wolf', () => {
  test('jumped over the lazy dog, as a locative', () => {
    expect(sayAll(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'locative'))).toMatchObject({
      en: 'the quick brown fox of the boy who cried the wolf jumped over the lazy dog.',
      // A place takes the dative after über. The possessor is "vom", not the genitive "des" (B09).
      de: 'der schnelle braune Fuchs vom Jungen, der den Wolf rief, sprang über dem faulen Hund.',
      es: 'el zorro rápido y marrón del niño que gritó el lobo saltó por encima del perro perezoso.',
      pt: 'a raposa rápida e castanha do menino que gritou o lobo pulou por cima do cão preguiçoso.',
      // で marks the place where the jumping happens.
      ja: '狼を叫んだ男の子の速い茶色のキツネは怠惰な犬の上で跳びました。',
    });
  });

  test('jumped over the lazy dog, as a route', () => {
    expect(sayAll(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'route'))).toMatchObject({
      en: 'the quick brown fox of the boy who cried the wolf jumped over the lazy dog.',
      es: 'el zorro rápido y marrón del niño que gritó el lobo saltó por encima del perro perezoso.',
      pt: 'a raposa rápida e castanha do menino que gritou o lobo pulou por cima do cão preguiçoso.',
      // を marks the path the jump crosses.
      ja: '狼を叫んだ男の子の速い茶色のキツネは怠惰な犬の上を跳びました。',
    });
  });

  // English is the language that shows where the relative clause attaches. On the possessor it keeps
  // the of-phrase and relativises the boy with "who". On the fox it takes the Saxon genitive and
  // relativises the fox with "that".
  test('the relative clause belongs to the boy, not to the fox', () => {
    const onTheFox = theQuickBrownFoxOf(np('BOY'), {
      relative: { verbPhrase: { verb: 'CRY_OUT', tense: 'past' }, directObject: np('WOLF') },
    });
    expect(say(jumpedOver(onTheFox, 'locative'), 'en'))
      .toBe("the boy's quick brown fox that cried the wolf jumped over the lazy dog.");
  });

  // What CRY_OUT's object renders as on its own, and what a fix for A124 must leave alone: English
  // "cry wolf" is the bare noun, and a shouted word is an ordinary direct object in every language.
  test('the cry on its own', () => {
    expect(say(cried({ definiteness: 'bare' }), 'en')).toBe('the boy cried wolf.');
    expect(sayAll(clause(np('BOY'), 'CRY_OUT', { verbPhrase: { tense: 'past' }, directObject: np('WORD') })))
      .toEqual({
        en: 'the boy cried the word.',
        it: 'il ragazzo gridò la parola.',
        fr: 'le garçon cria le mot.',
        de: 'der Junge rief das Wort.',
        es: 'el niño gritó la palabra.',
        pt: 'o menino gritou a palavra.',
        ja: '男の子は単語を叫びました。',
      });
  });
});

// A124. CRY_OUT's direct object is the cry itself. Italian and French shout an alarm with a / à and
// the definite article ("gridare al lupo", "al fuoco", "al ladro"; "crier au loup", "au feu", "au
// voleur"). The engines render it as a plain object instead: "gridò il lupo" ("shouted the wolf"), or
// "gridò lupo" when the object is bare.
describe('known bugs: an alarm cry takes a / à in Italian and French', () => {
  test.fails('Italian cries "al lupo", French "au loup"', () => {
    expect(say(cried(), 'it')).toBe('il ragazzo gridò al lupo.');
    expect(say(cried({ definiteness: 'bare' }), 'it')).toBe('il ragazzo gridò al lupo.');
    expect(say(cried(), 'fr')).toBe('le garçon cria au loup.');
    expect(say(cried({ definiteness: 'bare' }), 'fr')).toBe('le garçon cria au loup.');
    expect(sayAll(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'locative'))).toMatchObject({
      it: 'la volpe veloce e marrone del ragazzo che gridò al lupo saltò sopra il cane pigro.',
      fr: 'le renard rapide et brun du garçon qui cria au loup sauta au-dessus du chien paresseux.',
    });
    expect(say(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'route'), 'it'))
      .toBe('la volpe veloce e marrone del ragazzo che gridò al lupo saltò sopra il cane pigro.');
  });
});

// A125, in the whole sentence. A route over the dog crosses it: German takes über + accusative ("über
// den faulen Hund") and French par-dessus ("par-dessus le chien paresseux"). The engines give the
// static forms a locative takes ("über dem", "au-dessus du"). French is matched on its ending, since
// the cry earlier in the sentence is A124. The minimal cases are in complements/route.test.ts.
describe('known bugs: a route over crosses the dog, in the whole sentence', () => {
  test.fails('German "über den faulen Hund", French "par-dessus le chien paresseux"', () => {
    expect(sayAll(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'route'))).toMatchObject({
      de: 'der schnelle braune Fuchs vom Jungen, der den Wolf rief, sprang über den faulen Hund.',
      fr: expect.stringMatching(/ sauta par-dessus le chien paresseux\.$/),
    });
  });
});
