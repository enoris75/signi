import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// P15. A verb takes several adverbs, and Spanish and Portuguese place each by its class. A further
// frequency adverb follows the primary after the verb, and keeps that slot when the primary stands in
// front ("todavía no", "nunca"). A further manner adverb follows them, ahead of a noun object, where a
// manner primary stands. A further direction or place adverb stands among the complements.
const espt = (plan: PhrasePlan) => {
  const { es, pt } = sayAll(plan);
  return { es, pt };
};
const catRuns = (verbPhrase: Partial<VerbPhrase>) => espt(clause(np('CAT'), 'RUN', { verbPhrase }));
const catEatsMouse = (verbPhrase: Partial<VerbPhrase>, object: NounPhrase = np('MOUSE')) =>
  espt(clause(np('CAT'), 'EAT', { directObject: object, verbPhrase }));

describe('P15: several adverbs in Spanish and Portuguese', () => {
  test('frequency + manner', () => {
    expect(catRuns({ modifier: 'OFTEN', modifiers: ['FAST'] })).toEqual({
      es: 'el gato corre a menudo rápido.',
      pt: 'o gato corre frequentemente rapidamente.',
    });
    expect(catRuns({ modifier: 'OFTEN', modifiers: ['FAST'], negative: true })).toEqual({
      es: 'el gato no corre a menudo rápido.',
      pt: 'o gato não corre frequentemente rapidamente.',
    });
    expect(catRuns({ modifier: 'OFTEN', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' })).toEqual({
      es: 'el gato había corrido a menudo rápido.',
      pt: 'o gato tinha corrido frequentemente rapidamente.',
    });
    expect(catRuns({ modifier: 'OFTEN', modifiers: ['FAST'], tense: 'future' })).toEqual({
      es: 'el gato correrá a menudo rápido.',
      pt: 'o gato correrá frequentemente rapidamente.',
    });
  });

  // Behind a noun object "el ratón rápido" would read as the adjective, so the manner adverb stays in
  // front of it, where a lone one stands.
  test('frequency + manner, with an object and a modal', () => {
    expect(catEatsMouse({ modifier: 'OFTEN', modifiers: ['FAST'] })).toEqual({
      es: 'el gato come a menudo rápido el ratón.',
      pt: 'o gato come frequentemente rapidamente o rato.',
    });
    expect(catEatsMouse({ modifier: 'OFTEN', modifiers: ['FAST'], modals: ['MUST'] })).toEqual({
      es: 'el gato debe comer a menudo rápido el ratón.',
      pt: 'o gato deve comer frequentemente rapidamente o rato.',
    });
    expect(catEatsMouse({ modifier: 'OFTEN', modifiers: ['FAST'] }, np('THIRD_PERSON'))).toEqual({
      es: 'el gato lo come a menudo rápido.',
      pt: 'o gato o come frequentemente rapidamente.',
    });
  });

  // The prospective splits a frequency adverb off after "estar" (A147); a further one goes with it,
  // and a manner one trails the whole group.
  test('frequency + frequency + manner in the prospective', () => {
    expect(catEatsMouse({ modifier: 'ALWAYS', modifiers: ['OFTEN', 'FAST'], aspect: 'prospective' })).toEqual({
      es: 'el gato está siempre a menudo a punto de comer rápido el ratón.',
      pt: 'o gato está sempre frequentemente prestes a comer rapidamente o rato.',
    });
  });

  test('manner + place, and manner + manner', () => {
    expect(catRuns({ modifier: 'FAST', modifiers: ['HERE'] })).toEqual({
      es: 'el gato corre rápido aquí.',
      pt: 'o gato corre rapidamente aqui.',
    });
    expect(catRuns({ modifier: 'SLOWLY', modifiers: ['WELL'] })).toEqual({
      es: 'el gato corre lentamente bien.',
      pt: 'o gato corre devagar bem.',
    });
  });

  test('frequency + place, and frequency + manner + place', () => {
    expect(catRuns({ modifier: 'OFTEN', modifiers: ['HERE'] })).toEqual({
      es: 'el gato corre a menudo aquí.',
      pt: 'o gato corre frequentemente aqui.',
    });
    expect(catRuns({ modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] })).toEqual({
      es: 'el gato corre a menudo rápido aquí.',
      pt: 'o gato corre frequentemente rapidamente aqui.',
    });
    expect(espt(clause(np('CAT'), 'EAT', {
      directObject: np('MOUSE'), interrogative: true, verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] },
    }))).toEqual({
      es: '¿el gato come a menudo rápido el ratón aquí?',
      pt: 'o gato come frequentemente rapidamente o rato aqui?',
    });
  });

  // A further adverb of place predicates where, as a lone one does, so BE is "estar".
  test('a further adverb of place picks "estar"', () => {
    expect(espt(clause(np('CAT'), 'BE', { verbPhrase: { modifier: 'OFTEN', modifiers: ['HERE'] } }))).toEqual({
      es: 'el gato está a menudo aquí.',
      pt: 'o gato está frequentemente aqui.',
    });
  });

  test('direction + place', () => {
    expect(catRuns({ modifier: 'UP', modifiers: ['HERE'] })).toEqual({
      es: 'el gato corre arriba aquí.',
      pt: 'o gato corre para cima aqui.',
    });
    expect(espt(clause(np('CAT'), 'MOVE', {
      directObject: np('BOOK'), complements: { locative: { phrase: np('HOUSE') } }, verbPhrase: { modifier: 'DOWN', modifiers: ['HERE'] },
    }))).toEqual({
      es: 'el gato mueve el libro abajo aquí en la casa.',
      pt: 'o gato move o livro para baixo aqui na casa.',
    });
    expect(espt(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP', modifiers: ['FAST'] } }))).toEqual({
      es: 'el gato mueve rápido el libro arriba.',
      pt: 'o gato move rapidamente o livro para cima.',
    });
  });

  test('frequency + frequency, around the negation', () => {
    expect(catRuns({ modifier: 'ALREADY', modifiers: ['OFTEN'] })).toEqual({
      es: 'el gato corre ya a menudo.',
      pt: 'o gato corre já frequentemente.',
    });
    // The primary stands in front of the "no", the further one keeps the slot after the verb.
    expect(espt(clause(np('CAT'), 'EAT', { verbPhrase: { modifier: 'ALREADY', modifiers: ['OFTEN'], negative: true, aspect: 'resultative' } }))).toEqual({
      es: 'el gato todavía no ha comido a menudo.',
      pt: 'o gato ainda não comeu frequentemente.',
    });
    expect(catRuns({ modifier: 'ALSO', modifiers: ['OFTEN'], negative: true })).toEqual({
      es: 'el gato tampoco corre a menudo.',
      pt: 'o gato também não corre frequentemente.',
    });
  });

  test('negative + manner, and negative + frequency', () => {
    expect(catRuns({ modifier: 'NEVER', modifiers: ['FAST'] })).toEqual({
      es: 'el gato nunca corre rápido.',
      pt: 'o gato nunca corre rapidamente.',
    });
    expect(catEatsMouse({ modifier: 'NEVER', modifiers: ['FAST'] })).toEqual({
      es: 'el gato nunca come rápido el ratón.',
      pt: 'o gato nunca come rapidamente o rato.',
    });
    expect(catEatsMouse({ modifier: 'NEVER', modifiers: ['FAST'], modals: ['MUST'] })).toEqual({
      es: 'el gato debe no comer nunca rápido el ratón.',
      pt: 'o gato deve não comer nunca rapidamente o rato.',
    });
    expect(catEatsMouse({ modifier: 'NEVER', modifiers: ['AGAIN'] })).toEqual({
      es: 'el gato nunca come de nuevo el ratón.',
      pt: 'o gato nunca come de novo o rato.',
    });
  });

  test('sentence + frequency', () => {
    expect(catRuns({ modifier: 'MAYBE', modifiers: ['OFTEN'] })).toEqual({
      es: 'quizás el gato corre a menudo.',
      pt: 'talvez o gato corra frequentemente.',
    });
    expect(catRuns({ modifier: 'MAYBE', modifiers: ['OFTEN', 'FAST'] })).toEqual({
      es: 'quizás el gato corre a menudo rápido.',
      pt: 'talvez o gato corra frequentemente rapidamente.',
    });
  });

  test('a further adverb that agrees with the subject', () => {
    expect(espt(clause(np('CAT', { number: 'plural', gender: 'fem' }), 'EAT', {
      verbPhrase: { modifier: 'OFTEN', modifiers: ['TOGETHER', 'HERE'] },
    }))).toEqual({
      es: 'las gatas comen a menudo juntas aquí.',
      pt: 'as gatas comem frequentemente juntas aqui.',
    });
  });

  test('in the passive', () => {
    expect(catEatsMouse({ modifier: 'OFTEN', modifiers: ['FAST', 'HERE'], voice: 'passive' })).toEqual({
      es: 'el ratón es comido a menudo rápido por el gato aquí.',
      pt: 'o rato é comido frequentemente rapidamente pelo gato aqui.',
    });
  });

  test('in a command, an instruction and a relative clause', () => {
    const eat = (verbPhrase: Partial<VerbPhrase>, extra: Partial<PhrasePlan> = {}) => espt({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST', 'HERE'], ...verbPhrase } }),
      imperative: true,
      ...extra,
    });
    expect(eat({})).toEqual({ es: 'come a menudo rápido el ratón aquí.', pt: 'coma frequentemente rapidamente o rato aqui.' });
    expect(eat({ negative: true })).toEqual({
      es: 'no comas a menudo rápido el ratón aquí.',
      pt: 'não coma frequentemente rapidamente o rato aqui.',
    });
    expect(eat({}, { imperativeRegister: 'instruction' })).toEqual({
      es: 'comer a menudo rápido el ratón aquí.',
      pt: 'comer frequentemente rapidamente o rato aqui.',
    });
    expect(espt(clause(np('DOG', {
      relative: { verbPhrase: { verb: 'EAT', modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] }, directObject: np('MOUSE') },
    }), 'RUN'))).toEqual({
      es: 'el perro que come a menudo rápido el ratón aquí corre.',
      pt: 'o cão que come frequentemente rapidamente o rato aqui corre.',
    });
  });
});
