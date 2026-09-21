import { describe, expect, test } from 'vitest';
import type { Complement, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';

// "The quick brown fox of the boy who cried the wolf jumped over the lazy dog": the pangram, with a
// possessor that carries its own relative clause. Each part is pinned on its own elsewhere: two
// adjectives on one head (adjectives.test.ts), a possessor (possession.test.ts), a relative on a person
// (relative.test.ts) and the spatial complements (complements/locative, complements/route). This file
// pins the whole sentence, so a regression in how the parts combine shows up here.
//
// Italian and French are asserted in the A124 block, where CRY_OUT's shouted alarm takes a / à, and
// German and French for the route in the A125 block, where "over" crosses the dog.

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
      en: 'the quick brown fox of the boy who cried wolf jumped over the lazy dog.',
      // A place takes the dative after über. The possessor is the genitive "des Jungen" (B09).
      de: 'der schnelle braune Fuchs des Jungen, der den Wolf rief, sprang über dem faulen Hund.',
      es: 'el zorro rápido y marrón del niño que gritó el lobo saltó por encima del perro perezoso.',
      pt: 'a raposa rápida e castanha do menino que gritou o lobo pulou por cima do cão preguiçoso.',
      // で marks the place where the jumping happens.
      ja: '狼を叫んだ男の子の速い茶色のキツネは怠惰な犬の上で跳びました。',
    });
  });

  test('jumped over the lazy dog, as a route', () => {
    expect(sayAll(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'route'))).toMatchObject({
      en: 'the quick brown fox of the boy who cried wolf jumped over the lazy dog.',
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
      .toBe("the boy's quick brown fox that cried wolf jumped over the lazy dog.");
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
  test('Italian cries "al lupo", French "au loup"', () => {
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

  const itFr = (plan: PhrasePlan) => {
    const { it, fr } = sayAll(plan);
    return { it, fr };
  };
  const cry = (object: NounElement, verbPhrase: Partial<VerbPhrase> = { tense: 'past' }, subject: NounElement = np('BOY')) =>
    itFr(clause(subject, 'CRY_OUT', { verbPhrase, directObject: object }));

  // FIRE is the other seeded danger. The frame fuses its article in every number, and holds under
  // negation, a modal and the compound past, where the cry still follows the verb.
  test('every alarm, in every number and verb group', () => {
    expect(cry(np('FIRE'))).toEqual({ it: 'il ragazzo gridò al fuoco.', fr: 'le garçon cria au feu.' });
    expect(cry(np('FIRE', { definiteness: 'bare' }))).toEqual({ it: 'il ragazzo gridò al fuoco.', fr: 'le garçon cria au feu.' });
    expect(cry(np('WOLF', { number: 'plural' }))).toEqual({ it: 'il ragazzo gridò ai lupi.', fr: 'le garçon cria aux loups.' });
    expect(cry(np('WOLF', { number: 'plural', definiteness: 'bare' }))).toEqual({ it: 'il ragazzo gridò ai lupi.', fr: 'le garçon cria aux loups.' });
    expect(cry(np('WOLF'), { tense: 'past', negative: true })).toEqual({ it: 'il ragazzo non gridò al lupo.', fr: 'le garçon ne cria pas au loup.' });
    expect(cry(np('WOLF'), { modals: ['MUST'] })).toEqual({ it: 'il ragazzo deve gridare al lupo.', fr: 'le garçon doit crier au loup.' });
    expect(cry(np('WOLF'), { aspect: 'resultative' })).toEqual({ it: 'il ragazzo ha gridato al lupo.', fr: 'le garçon a crié au loup.' });
  });

  // Each conjunct takes its own fused head. A possessive keeps its own article rules, and an adjective
  // its place after the noun. The frame's article is the only one: an indefinite alarm collapses into
  // it (A163).
  test('the alarm phrase around the noun', () => {
    expect(cry({ conjunction: 'and', conjuncts: [np('WOLF'), np('FIRE')] }))
      .toEqual({ it: 'il ragazzo gridò al lupo e al fuoco.', fr: 'le garçon cria au loup et au feu.' });
    expect(cry(np('WOLF', { possessor: { kind: 'pronominal', person: '3', number: 'singular' } })))
      .toEqual({ it: 'il ragazzo gridò al suo lupo.', fr: 'le garçon cria à son loup.' });
    expect(cry(np('WOLF', { adjectives: ['LAZY'] })))
      .toEqual({ it: 'il ragazzo gridò al lupo pigro.', fr: 'le garçon cria au loup paresseux.' });
    expect(cry(np('WOLF', { definiteness: 'indefinite' })))
      .toEqual({ it: 'il ragazzo gridò al lupo.', fr: 'le garçon cria au loup.' });
  });

  // The cry is no direct object, so the Italian impersonal si does not agree with a plural one.
  test('the impersonal si stays singular before a plural alarm', () => {
    expect(cry(np('WOLF', { number: 'plural' }), {}, np('GENERIC_PERSON'))).toEqual({ it: 'si grida ai lupi.', fr: 'on crie aux loups.' });
  });

  // Regression: the frame is CRY_OUT's, and only for a danger. A wolf seen is a plain object, a recipient
  // keeps its own a / à after the cry, and German keeps the literal object. English cries it bare (A163).
  test('regression: another verb, a recipient, and the other languages are unchanged', () => {
    expect(itFr(clause(np('BOY'), 'SEE', { verbPhrase: { tense: 'past' }, directObject: np('WOLF') })))
      .toEqual({ it: 'il ragazzo vide il lupo.', fr: 'le garçon vit le loup.' });
    expect(itFr(clause(np('BOY'), 'CRY_OUT', { verbPhrase: { tense: 'past' }, directObject: np('WOLF'), complements: { terminus: { phrase: np('DOG') } } })))
      .toEqual({ it: 'il ragazzo gridò al lupo al cane.', fr: 'le garçon cria au loup au chien.' });
    expect(sayAll(cried())).toMatchObject({
      en: 'the boy cried wolf.',
      de: 'der Junge rief den Wolf.',
    });
  });
});

// A125, in the whole sentence. A route over the dog crosses it: German takes über + accusative ("über
// den faulen Hund") and French par-dessus ("par-dessus le chien paresseux"). The engines give the
// static forms a locative takes ("über dem", "au-dessus du"). French is matched on its ending, since
// the cry earlier in the sentence is A124. The minimal cases are in complements/route.test.ts.
describe('known bugs: a route over crosses the dog, in the whole sentence', () => {
  test('German "über den faulen Hund", French "par-dessus le chien paresseux"', () => {
    expect(sayAll(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'route'))).toMatchObject({
      de: 'der schnelle braune Fuchs des Jungen, der den Wolf rief, sprang über den faulen Hund.',
      fr: expect.stringMatching(/ sauta par-dessus le chien paresseux\.$/),
    });
  });
});

// A129. A relative clause on the cried alarm ("the wolf that the boy cried") treats the head as a
// plain direct object: "il lupo che il ragazzo gridò", "le loup que le garçon cria". In Italian and
// French the alarm is the a / à complement of A124, so the relative takes the preposition and the
// relativizer a complement gap takes (A62): "al quale", "auquel". The reading is marginal even in
// English, but the plain "che" / "que" is ungrammatical with the alarm frame.
describe('known bugs: a relative on the alarm a cry raises', () => {
  const theWolfTheBoyCried = (wolf: Partial<NounPhrase> = {}, head = 'WOLF', verb = 'RUN') =>
    sayAll(clause(np(head, { ...wolf, relative: { headRole: 'directObject', subject: np('BOY'), verbPhrase: { verb: 'CRY_OUT', tense: 'past' } } }), verb));

  test('Italian and French relativise the alarm with al quale / auquel', () => {
    expect(theWolfTheBoyCried()).toMatchObject({
      it: 'il lupo al quale il ragazzo gridò corre.',
      fr: 'le loup auquel le garçon cria court.',
    });
    expect(theWolfTheBoyCried({ number: 'plural' })).toMatchObject({
      it: 'i lupi ai quali il ragazzo gridò corrono.',
      fr: 'les loups auxquels le garçon cria courent.',
    });
    expect(theWolfTheBoyCried({}, 'FIRE', 'BURN')).toMatchObject({
      it: 'il fuoco al quale il ragazzo gridò brucia.',
      fr: 'le feu auquel le garçon cria brûle.',
    });
  });

  // The present and the resultative, whose French participle does not agree with an à complement, a negated
  // cry, a modal, and the impersonal subject, which stays impersonal: an alarm is no object for si to agree with.
  test('Italian and French relativise the alarm the same way in every tense, under a modal and with an impersonal subject', () => {
    const cried = (verbPhrase: Partial<VerbPhrase>, wolf: Partial<NounPhrase> = {}, subject = 'BOY') =>
      sayAll(clause(np('WOLF', { ...wolf, relative: { headRole: 'directObject', subject: np(subject), verbPhrase: { verb: 'CRY_OUT', ...verbPhrase } } }), 'RUN'));
    expect(cried({})).toMatchObject({ it: 'il lupo al quale il ragazzo grida corre.', fr: 'le loup auquel le garçon crie court.' });
    expect(cried({ aspect: 'resultative' }, { number: 'plural' })).toMatchObject({
      it: 'i lupi ai quali il ragazzo ha gridato corrono.',
      fr: 'les loups auxquels le garçon a crié courent.',
    });
    expect(cried({ tense: 'past', negative: true })).toMatchObject({
      it: 'il lupo al quale il ragazzo non gridò corre.',
      fr: 'le loup auquel le garçon ne cria pas court.',
    });
    expect(cried({ modals: ['MUST'] })).toMatchObject({ it: 'il lupo al quale il ragazzo deve gridare corre.', fr: 'le loup auquel le garçon doit crier court.' });
    expect(cried({}, { number: 'plural' }, 'GENERIC_PERSON')).toMatchObject({ it: 'i lupi ai quali si grida corrono.', fr: 'les loups auxquels on crie courent.' });
    expect(cried({ aspect: 'resultative' }, { number: 'plural' }, 'GENERIC_PERSON')).toMatchObject({ it: 'i lupi ai quali si è gridato corrono.', fr: 'les loups auxquels on a crié courent.' });
  });

  test('regression: a relative on a plain cry keeps che / que', () => {
    expect(theWolfTheBoyCried({}, 'WORD', 'BURN')).toMatchObject({
      it: 'la parola che il ragazzo gridò brucia.',
      fr: 'le mot que le garçon cria brûle.',
    });
    // The plain cry keeps the French participle agreement, and the recipient keeps its own al quale / auquel.
    expect(sayAll(clause(np('WORD', { number: 'plural', relative: { headRole: 'directObject', subject: np('BOY'), verbPhrase: { verb: 'CRY_OUT', aspect: 'resultative' } } }), 'BURN')))
      .toMatchObject({ it: 'le parole che il ragazzo ha gridato bruciano.', fr: 'les mots que le garçon a criés brûlent.' });
    expect(sayAll(clause(np('WOLF', { relative: { headRole: 'terminus', subject: np('BOY'), verbPhrase: { verb: 'CRY_OUT', tense: 'past' }, directObject: np('WORD') } }), 'RUN')))
      .toMatchObject({ it: 'il lupo al quale il ragazzo gridò la parola corre.', fr: 'le loup auquel le garçon cria le mot court.' });
  });
});

// A163. An alarm cry is the shout itself — the word "Wolf!" — not a referring noun phrase, so it has
// no determiner slot. A124 normalised a *bare* object to the fused article in Italian and French; the
// determiner the user picked still reaches the output everywhere else. English has no alarm frame at
// all, and transitive "cry" wants an utterance, so "cried the wolf" and "cried a wolf" are both
// ungrammatical — only the bare "cried wolf" is right today. Italian and French keep an indefinite
// inside the frame, which reads as the terminus ("shouted at a wolf"), and Italian's bare "a lupi" is
// ungrammatical outright.
describe('known bugs: an alarm cry has no determiner', () => {
  test('English cries the bare alarm whatever determiner the object carries', () => {
    expect(say(cried(), 'en')).toBe('the boy cried wolf.');
    expect(say(cried({ definiteness: 'indefinite' }), 'en')).toBe('the boy cried wolf.');
    expect(say(cried({ number: 'plural' }), 'en')).toBe('the boy cried wolves.');
    expect(say(clause(np('BOY'), 'CRY_OUT', { verbPhrase: { tense: 'past' }, directObject: np('FIRE') }), 'en'))
      .toBe('the boy cried fire.');
    // The pangram's own relative clause, the sentence this was found on.
    expect(say(jumpedOver(theQuickBrownFoxOf(theBoyWhoCriedTheWolf()), 'locative'), 'en'))
      .toBe('the quick brown fox of the boy who cried wolf jumped over the lazy dog.');
  });

  test('Italian and French collapse an indefinite alarm into the frame', () => {
    expect(sayAll(cried({ definiteness: 'indefinite' }))).toMatchObject({
      it: 'il ragazzo gridò al lupo.',
      fr: 'le garçon cria au loup.',
    });
    expect(sayAll(cried({ definiteness: 'indefinite', number: 'plural' }))).toMatchObject({
      it: 'il ragazzo gridò ai lupi.',
      fr: 'le garçon cria aux loups.',
    });
  });

  const enItFr = (plan: PhrasePlan) => {
    const { en, it, fr } = sayAll(plan);
    return { en, it, fr };
  };
  const cry = (object: NounElement, verbPhrase: Partial<VerbPhrase> = { tense: 'past' }, rest: Partial<PhrasePlan> = {}) =>
    enItFr(clause(np('BOY'), 'CRY_OUT', { verbPhrase, directObject: object, ...rest }));

  // Every determiner, not just the indefinite: a quantifier, a demonstrative, the negative.
  test('every determiner collapses into the one the frame spells', () => {
    expect(cry(np('FIRE', { definiteness: 'this' })))
      .toEqual({ en: 'the boy cried fire.', it: 'il ragazzo gridò al fuoco.', fr: 'le garçon cria au feu.' });
    expect(cry(np('WOLF', { definiteness: 'all', number: 'plural' })))
      .toEqual({ en: 'the boy cried wolves.', it: 'il ragazzo gridò ai lupi.', fr: 'le garçon cria aux loups.' });
    expect(cry(np('WOLF', { definiteness: 'no' })))
      .toEqual({ en: 'the boy cried wolf.', it: 'il ragazzo gridò al lupo.', fr: 'le garçon cria au loup.' });
  });

  // A `no` alarm drops its negation with its determiner, so the clause is negated by its verb or not at
  // all: never French's "ne" left without its "aucun", nor English's "any" standing in for it.
  test('a negative alarm leaves no negation behind', () => {
    expect(cry(np('WOLF', { definiteness: 'no' }), { tense: 'past', negative: true }))
      .toEqual({ en: 'the boy did not cry wolf.', it: 'il ragazzo non gridò al lupo.', fr: 'le garçon ne cria pas au loup.' });
  });

  // The relative clause the pangram carries, and the other verb groups the alarm follows.
  test('in a relative clause, a question and the future', () => {
    const theBoyWhoCried = (wolf: Partial<NounPhrase>) =>
      enItFr(clause(np('BOY', { relative: { verbPhrase: { verb: 'CRY_OUT', tense: 'past' }, directObject: np('WOLF', wolf) } }), 'RUN'));
    expect(theBoyWhoCried({ definiteness: 'indefinite' }))
      .toEqual({ en: 'the boy who cried wolf runs.', it: 'il ragazzo che gridò al lupo corre.', fr: 'le garçon qui cria au loup court.' });
    expect(theBoyWhoCried({ definiteness: 'indefinite', number: 'plural' }))
      .toEqual({ en: 'the boy who cried wolves runs.', it: 'il ragazzo che gridò ai lupi corre.', fr: 'le garçon qui cria aux loups court.' });
    expect(cry(np('WOLF', { definiteness: 'indefinite' }), { tense: 'past' }, { interrogative: true }))
      .toEqual({ en: 'did the boy cry wolf?', it: 'il ragazzo gridò al lupo?', fr: 'est-ce que le garçon cria au loup\u00a0?' });
    expect(cry(np('WOLF', { definiteness: 'indefinite' }), { tense: 'future' }))
      .toEqual({ en: 'the boy will cry wolf.', it: 'il ragazzo griderà al lupo.', fr: 'le garçon criera au loup.' });
  });

  // Each alarm in a coordinated object, and only the alarms: a shouted word keeps its own determiner.
  test('each alarm of a group, and no other conjunct', () => {
    expect(cry({ conjunction: 'and', conjuncts: [np('WOLF', { definiteness: 'no' }), np('FIRE', { definiteness: 'indefinite' })] }))
      .toEqual({ en: 'the boy cried wolf and fire.', it: 'il ragazzo gridò al lupo e al fuoco.', fr: 'le garçon cria au loup et au feu.' });
    expect(cry({ conjunction: 'and', conjuncts: [np('WOLF', { definiteness: 'indefinite' }), np('WORD', { definiteness: 'indefinite' })] }))
      .toEqual({ en: 'the boy cried wolf and a word.', it: 'il ragazzo gridò al lupo e una parola.', fr: 'le garçon cria au loup et un mot.' });
  });

  // The languages with no alarm frame keep the literal object (A124 left them out), but the determiner
  // is gone for them too: the canvas offers none (A164), so a saved plan renders as a new one would.
  test('the languages with no frame keep the literal object, definite whatever the plan says', () => {
    for (const definiteness of ['indefinite', 'no'] as const) {
      expect(sayAll(cried({ definiteness }))).toMatchObject({
        de: 'der Junge rief den Wolf.',
        es: 'el niño gritó el lobo.',
        pt: 'o menino gritou o lobo.',
        ja: '男の子は狼を叫びました。',
      });
    }
  });

  // Regression: the determiner is only ignored on an alarm. An ordinary cry keeps the one it was
  // given, in every language — this is what an English alarm arm must not break.
  test('regression: a cry that is not an alarm keeps its determiner', () => {
    expect(sayAll(clause(np('BOY'), 'CRY_OUT', { verbPhrase: { tense: 'past' }, directObject: np('WORD', { definiteness: 'indefinite' }) })))
      .toMatchObject({
        en: 'the boy cried a word.',
        it: 'il ragazzo gridò una parola.',
        fr: 'le garçon cria un mot.',
      });
  });
});
