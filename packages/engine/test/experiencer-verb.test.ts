import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C34: LIKE, and the experiencer frame three of the seven need for it. The plan is
// always "the cat likes the dog"; Italian and Spanish turn it round (the thing liked is the
// subject, the one who likes a dative), Portuguese takes a prepositional object, and Japanese has
// no verb at all — 好き is a な-adjective whose が-marked subject is the thing liked.

function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('LIKE in a main clause', () => {
  test('the seven renderings', () => {
    expect(sayAll(clause(np('CAT'), 'LIKE', { directObject: np('DOG') }))).toEqual({
      en: 'the cat likes the dog.', it: 'al gatto piace il cane.', fr: 'le chat aime le chien.',
      de: 'der Kater mag den Hund.', es: 'al gato le gusta el perro.', ja: '猫は犬が好きです。',
      pt: 'o gato gosta do cão.',
    });
  });

  // The verb agrees with the thing liked, because that is its subject — which is the whole point of
  // the frame, and what a plain transitive rendering gets wrong.
  test('Italian and Spanish agree with the thing liked, not with the one who likes', () => {
    expect(sayAll(clause(np('CAT'), 'LIKE', { directObject: np('DOG', { number: 'plural' }) }))).toMatchObject({
      it: 'al gatto piacciono i cani.', es: 'al gato le gustan los perros.',
      en: 'the cat likes the dogs.', de: 'der Kater mag die Hunde.',
    });
    // …and not with the experiencer's number either: "al gatto" plural moves only the clitic.
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'LIKE', { directObject: np('DOG') }))).toMatchObject({
      it: 'ai gatti piace il cane.', es: 'a los gatos les gusta el perro.',
    });
  });

  test('the Spanish clitic agrees in person with the experiencer', () => {
    expect(say(clause(np('FIRST_PERSON'), 'LIKE', { directObject: np('DOG') }), 'es'))
      .toBe('me gusta el perro.');
  });

  test('tense and negation ride on the re-mapped clause', () => {
    expect(sayAll(clause(np('CAT'), 'LIKE', {
      verbPhrase: { tense: 'past' }, directObject: np('DOG'),
    }))).toMatchObject({ it: 'al gatto piaceva il cane.', es: 'al gato le gustaba el perro.', ja: '猫は犬が好きでした。' });
    expect(sayAll(clause(np('CAT'), 'LIKE', {
      verbPhrase: { negative: true }, directObject: np('DOG'),
    }))).toMatchObject({
      it: 'al gatto non piace il cane.', es: 'al gato no le gusta el perro.',
      ja: '猫は犬が好きではありません。', de: 'der Kater mag den Hund nicht.',
    });
  });

  test('an adjunct still lands where it belongs', () => {
    expect(sayAll(clause(np('CAT'), 'LIKE', {
      directObject: np('DOG'), complements: { locative: { phrase: np('HOUSE') } },
    }))).toMatchObject({
      it: 'al gatto piace il cane nella casa.', ja: '猫は家で犬が好きです。', en: 'the cat likes the dog in the house.',
    });
  });
});

describe('LIKE in a relative clause', () => {
  test('the gap moves with the slot the head fills', () => {
    // The head is the one who likes: in Italian and Spanish it is the clause's dative.
    expect(sayAll({ subject: np('CAT', { relative: {
      headRole: 'subject', verbPhrase: { verb: 'LIKE' }, directObject: np('DOG'),
    } }) })).toEqual({
      en: 'the cat that likes the dog.', it: 'il gatto al quale piace il cane.',
      fr: 'le chat qui aime le chien.', de: 'der Kater, der den Hund mag.',
      es: 'el gato al que le gusta el perro.', ja: '犬が好きな猫。', pt: 'o gato que gosta do cão.',
    });
    // The head is the thing liked: there it is the clause's subject.
    expect(sayAll({ subject: np('DOG', { relative: {
      headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'LIKE' },
    } }) })).toEqual({
      en: 'the dog that the cat likes.', it: 'il cane che piace al gatto.',
      fr: 'le chien que le chat aime.', de: 'der Hund, den der Kater mag.',
      es: 'el perro que le gusta al gato.', ja: '猫が好きな犬。', pt: 'o cão do qual o gato gosta.',
    });
  });
});

describe('the citation, and the word', () => {
  // A generic experiencer is dropped, as a generic agent is under the passive: no language says
  // "piacere a si". What is left cannot name the thing liked, because in Italian and Spanish that
  // thing is the verb's subject and a citation has none.
  test('the citation drops a generic experiencer', () => {
    expect(sayAll({
      subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'LIKE' }, directObject: np('DOG'), infinitive: true,
    })).toEqual({
      en: 'to like the dog.', it: 'piacere.', fr: 'aimer le chien.', de: 'den Hund mögen.',
      es: 'gustar.', ja: '犬が好きである。', pt: 'gostar do cão.',
    });
  });

  test('LIKE is glossed by the joy the thing causes', () => {
    expect(definitionAll('LIKE')).toEqual({
      en: 'to feel joy because of an object.', it: 'provare gioia a causa di un oggetto.',
      fr: "éprouver de la joie à cause d'un objet.", de: 'Freude wegen eines Gegenstands fühlen.',
      es: 'sentir alegría a causa de un objeto.', ja: '物体のために喜びを感じる。',
      pt: 'sentir alegria por causa de um objeto.',
    });
  });
});

// A367: a wh-question asking about the thing liked leaves the object slot empty, so the frame is
// never turned round. The one who likes stays the subject and the verb agrees with it, "chi piaccio?"
// ("who do I please?") for "chi mi piace?". The statement and the relative clause both turn it round.
describe('known bugs: an experiencer verb asked about its object keeps the one who likes as the subject (A367)', () => {
  const what = (subject: ReturnType<typeof np>, verbPhrase = {}, animate = false) => clause(subject, 'LIKE', {
    verbPhrase, interrogative: true, questionRole: 'directObject', questionAnimate: animate,
  });

  test('the thing liked is the question word, the one who likes the dative', () => {
    expect(sayAll(what(np('FIRST_PERSON'), {}, true))).toMatchObject({ it: 'chi mi piace?', es: '¿quién me gusta?' });
    expect(sayAll(what(np('CAT')))).toMatchObject({ it: 'che cosa piace al gatto?', es: '¿qué le gusta al gato?' });
    expect(sayAll(what(np('CAT', { number: 'plural' })))).toMatchObject({
      it: 'che cosa piace ai gatti?', es: '¿qué les gusta a los gatos?',
    });
  });

  test('tense, negation and the generic experiencer ride on the re-mapped question', () => {
    expect(sayAll(what(np('CAT'), { negative: true, tense: 'past' }))).toMatchObject({
      it: 'che cosa non piaceva al gatto?', es: '¿qué no le gustaba al gato?',
    });
    expect(sayAll(what(np('GENERIC_PERSON')))).toMatchObject({ it: 'che cosa piace?', es: '¿qué le gusta a uno?' });
  });

  test('the five languages with a plain transitive verb ask it as one', () => {
    expect(sayAll(what(np('FIRST_PERSON'), {}, true))).toMatchObject({
      en: 'who do I like?', fr: "qui est-ce que j'aime ?", de: 'wen mag ich?', ja: '私は誰が好きですか？',
      pt: 'de quem gosto?',
    });
  });
});

// A368: a wh-question asking about the one who likes gaps the subject, which the frame makes the
// dative, but the gap stays the subject: "chi piaccio a?" for "a chi piaccio?", "¿quién le gusto a?"
// for "¿a quién le gusto?".
describe('known bugs: an experiencer verb asked about its subject gaps the subject, not the dative (A368)', () => {
  const who = (liked: ReturnType<typeof np>) => clause(np('CAT'), 'LIKE', {
    directObject: liked, interrogative: true, questionRole: 'subject', questionAnimate: true,
  });

  test('the one who likes is the dative question word, the thing liked the subject', () => {
    expect(sayAll(who(np('DOG')))).toMatchObject({ it: 'a chi piace il cane?', es: '¿a quién le gusta el perro?' });
    expect(sayAll(who(np('DOG', { number: 'plural' })))).toMatchObject({
      it: 'a chi piacciono i cani?', es: '¿a quién le gustan los perros?',
    });
    expect(sayAll(who(np('FIRST_PERSON')))).toMatchObject({ it: 'a chi piaccio?', es: '¿a quién le gusto?' });
  });

  test('the other gaps, and the five languages with a plain transitive verb, are left as they are', () => {
    expect(sayAll(who(np('FIRST_PERSON')))).toMatchObject({
      en: 'who likes me?', fr: "qui m'aime ?", de: 'wer mag mich?', ja: '誰が私が好きですか？', pt: 'quem gosta de mim?',
    });
    expect(sayAll(clause(np('CAT'), 'LIKE', {
      directObject: np('DOG'), interrogative: true, questionRole: 'locative',
    }))).toMatchObject({ it: 'dove piace al gatto il cane?', es: '¿dónde le gusta al gato el perro?' });
    expect(sayAll(clause(np('CAT'), 'LIKE', { directObject: np('DOG'), interrogative: true }))).toMatchObject({
      it: 'al gatto piace il cane?', es: '¿al gato le gusta el perro?',
    });
  });
});

// A369: Italian piacere and Spanish gustar put the one who likes first and the thing liked after the
// verb, "al gatto piace il cane", "mi piace un angelo". The engine keeps the transitive order with the
// subject in front, "il cane piace al gatto", "un angelo mi piace", which reads as marked (the dog,
// as opposed to something else, pleases the cat). Spanish also doubles a pronoun experiencer with its
// tonic form, "me gusta a mí", which is the contrastive reading, not the plain one.
describe('known bugs: an experiencer verb keeps the thing liked in front of the verb (A369)', () => {
  const likes = (subject: ReturnType<typeof np>, liked: ReturnType<typeof np>, extra = {}) =>
    clause(subject, 'LIKE', { directObject: liked, ...extra });

  test('the dative leads and the thing liked follows the verb', () => {
    expect(sayAll(likes(np('CAT'), np('DOG')))).toMatchObject({ it: 'al gatto piace il cane.', es: 'al gato le gusta el perro.' });
    expect(sayAll(likes(np('CAT'), np('DOG', { number: 'plural' })))).toMatchObject({
      it: 'al gatto piacciono i cani.', es: 'al gato le gustan los perros.',
    });
    expect(sayAll(likes(np('CAT', { number: 'plural' }), np('DOG')))).toMatchObject({
      it: 'ai gatti piace il cane.', es: 'a los gatos les gusta el perro.',
    });
    expect(sayAll(likes(np('CAT'), np('DOG'), { complements: { locative: { phrase: np('HOUSE') } } }))).toMatchObject({
      it: 'al gatto piace il cane nella casa.', es: 'al gato le gusta el perro en la casa.',
    });
  });

  test('a pronoun experiencer is the clitic alone, with the thing liked after the verb', () => {
    expect(sayAll(likes(np('FIRST_PERSON'), np('ANGEL', { definiteness: 'indefinite' })))).toMatchObject({
      it: 'mi piace un angelo.', es: 'me gusta un ángel.',
    });
    expect(sayAll(likes(np('THIRD_PERSON', { gender: 'fem' }), np('DOG')))).toMatchObject({
      it: 'le piace il cane.', es: 'le gusta el perro.',
    });
    expect(sayAll(clause(np('FIRST_PERSON'), 'LIKE', {
      interrogative: true, questionRole: 'directObject', questionAnimate: true,
    })).es).toBe('¿quién me gusta?');
  });

  test('tense, negation, a yes/no question and a negative thing liked keep the order', () => {
    expect(sayAll(likes(np('CAT'), np('DOG'), { verbPhrase: { tense: 'past' } }))).toMatchObject({
      it: 'al gatto piaceva il cane.', es: 'al gato le gustaba el perro.',
    });
    expect(sayAll(likes(np('CAT'), np('DOG'), { verbPhrase: { negative: true } }))).toMatchObject({
      it: 'al gatto non piace il cane.', es: 'al gato no le gusta el perro.',
    });
    expect(sayAll(likes(np('CAT'), np('DOG'), { interrogative: true }))).toMatchObject({
      it: 'al gatto piace il cane?', es: '¿al gato le gusta el perro?',
    });
    expect(sayAll(likes(np('CAT'), np('DOG', { definiteness: 'no' })))).toMatchObject({
      it: 'al gatto non piace nessun cane.', es: 'al gato no le gusta ningún perro.',
    });
  });

  test('Spanish fronts the generic "a uno"; a relative on the one who likes puts the thing liked last', () => {
    expect(sayAll(likes(np('GENERIC_PERSON'), np('CAT')))).toMatchObject({ es: 'a uno le gusta el gato.' });
    expect(sayAll({ subject: np('CAT', { relative: {
      headRole: 'subject', verbPhrase: { verb: 'LIKE' }, directObject: np('DOG'),
    } }) })).toMatchObject({ it: 'il gatto al quale piace il cane.', es: 'el gato al que le gusta el perro.' });
  });

  test('what is already in this order, and the five plain transitive languages, are left alone', () => {
    // Italian drops the generic experiencer, so nothing leads: "il gatto piace", as a passive would.
    expect(sayAll(likes(np('GENERIC_PERSON'), np('CAT'))).it).toBe('il gatto piace.');
    expect(sayAll(likes(np('CAT'), np('DOG')))).toMatchObject({
      en: 'the cat likes the dog.', fr: 'le chat aime le chien.', de: 'der Kater mag den Hund.',
      ja: '猫は犬が好きです。', pt: 'o gato gosta do cão.',
    });
    expect(sayAll(clause(np('CAT'), 'LIKE', { interrogative: true, questionRole: 'directObject' }))).toMatchObject({
      it: 'che cosa piace al gatto?', es: '¿qué le gusta al gato?',
    });
  });
});
