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
      en: 'the cat likes the dog.', it: 'il cane piace al gatto.', fr: 'le chat aime le chien.',
      de: 'der Kater mag den Hund.', es: 'el perro le gusta al gato.', ja: '猫は犬が好きです。',
      pt: 'o gato gosta do cão.',
    });
  });

  // The verb agrees with the thing liked, because that is its subject — which is the whole point of
  // the frame, and what a plain transitive rendering gets wrong.
  test('Italian and Spanish agree with the thing liked, not with the one who likes', () => {
    expect(sayAll(clause(np('CAT'), 'LIKE', { directObject: np('DOG', { number: 'plural' }) }))).toMatchObject({
      it: 'i cani piacciono al gatto.', es: 'los perros le gustan al gato.',
      en: 'the cat likes the dogs.', de: 'der Kater mag die Hunde.',
    });
    // …and not with the experiencer's number either: "al gatto" plural moves only the clitic.
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'LIKE', { directObject: np('DOG') }))).toMatchObject({
      it: 'il cane piace ai gatti.', es: 'el perro les gusta a los gatos.',
    });
  });

  test('the Spanish clitic agrees in person with the experiencer', () => {
    expect(say(clause(np('FIRST_PERSON'), 'LIKE', { directObject: np('DOG') }), 'es'))
      .toBe('el perro me gusta a mí.');
  });

  test('tense and negation ride on the re-mapped clause', () => {
    expect(sayAll(clause(np('CAT'), 'LIKE', {
      verbPhrase: { tense: 'past' }, directObject: np('DOG'),
    }))).toMatchObject({ it: 'il cane piaceva al gatto.', es: 'el perro le gustaba al gato.', ja: '猫は犬が好きでした。' });
    expect(sayAll(clause(np('CAT'), 'LIKE', {
      verbPhrase: { negative: true }, directObject: np('DOG'),
    }))).toMatchObject({
      it: 'il cane non piace al gatto.', es: 'el perro no le gusta al gato.',
      ja: '猫は犬が好きではありません。', de: 'der Kater mag den Hund nicht.',
    });
  });

  test('an adjunct still lands where it belongs', () => {
    expect(sayAll(clause(np('CAT'), 'LIKE', {
      directObject: np('DOG'), complements: { locative: { phrase: np('HOUSE') } },
    }))).toMatchObject({
      it: 'il cane piace al gatto nella casa.', ja: '猫は家で犬が好きです。', en: 'the cat likes the dog in the house.',
    });
  });
});

describe('LIKE in a relative clause', () => {
  test('the gap moves with the slot the head fills', () => {
    // The head is the one who likes: in Italian and Spanish it is the clause's dative.
    expect(sayAll({ subject: np('CAT', { relative: {
      headRole: 'subject', verbPhrase: { verb: 'LIKE' }, directObject: np('DOG'),
    } }) })).toEqual({
      en: 'the cat that likes the dog.', it: 'il gatto al quale il cane piace.',
      fr: 'le chat qui aime le chien.', de: 'der Kater, der den Hund mag.',
      es: 'el gato al que el perro le gusta.', ja: '犬が好きな猫。', pt: 'o gato que gosta do cão.',
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
