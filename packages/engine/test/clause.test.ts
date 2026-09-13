import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// The shape of a clause: subject, verb, object — agreement, case, and word order.
describe('clause', () => {
  test('subject and verb', () => {
    expect(sayAll(clause(np('CAT'), 'EAT'))).toEqual({
      en: 'the cat eats.',
      it: 'il gatto mangia.',
      fr: 'le chat mange.',
      es: 'el gato come.',
      pt: 'o gato come.',
      de: 'der Kater isst.',
      ja: '猫は食べます。',
    });
  });

  test('a verbless period is a bare noun phrase', () => {
    expect(sayAll({ subject: np('CAT') })).toEqual({
      en: 'the cat.',
      it: 'il gatto.',
      fr: 'le chat.',
      es: 'el gato.',
      pt: 'o gato.',
      de: 'der Kater.',
      ja: '猫。',
    });
  });

  test('a verbless period drops objects and complements — they hang off the verb', () => {
    // A half-built plan with no verb renders just the subject: the directObject and the locative
    // are meaningless without a verb, so they are dropped, not rendered loose.
    const bareSubject = sayAll({ subject: np('CAT') });
    expect(sayAll({
      subject: np('CAT'),
      directObject: np('MOUSE'),
      complements: { locative: { phrase: np('HOUSE') } },
    } as PhrasePlan)).toEqual(bareSubject);
  });

  test('the verb agrees with a plural subject', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'EAT'))).toEqual({
      en: 'the cats eat.',
      it: 'i gatti mangiano.',
      fr: 'les chats mangent.',
      es: 'los gatos comen.',
      pt: 'os gatos comem.',
      de: 'die Kater essen.',
      // Japanese does not mark number on the noun or agree the verb.
      ja: '猫は食べます。',
    });
  });

  test('a gendered noun selects its feminine lexeme, and the article follows', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'EAT'))).toEqual({
      en: 'the cat eats.',
      it: 'la gatta mangia.',
      fr: 'la chatte mange.',
      es: 'la gata come.',
      pt: 'a gata come.',
      de: 'die Katze isst.',
      ja: '猫は食べます。',
    });
  });

  test('a direct object takes the accusative', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE') }))).toEqual({
      en: 'the cat eats the mouse.',
      it: 'il gatto mangia il topo.',
      fr: 'le chat mange la souris.',
      es: 'el gato come el ratón.',
      pt: 'o gato come o rato.',
      // German is the only one of the seven that marks the case on the article.
      de: 'der Kater isst die Maus.',
      // Japanese marks it with the particle を.
      ja: '猫はネズミを食べます。',
    });
  });

  test('the verb agrees with the person of a pronoun subject', () => {
    // Italian, Spanish and Portuguese are pro-drop: the pronoun subject is dropped and the verb
    // ending alone carries the person ("mangio", not "io mangio"). French, German and English keep
    // the overt pronoun, so the agreement shows there as the pronoun + inflected verb.
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT'))).toEqual({
      en: 'I eat.',
      it: 'mangio.',
      fr: 'je mange.',
      es: 'como.',
      pt: 'como.',
      de: 'ich esse.',
      ja: '私は食べます。',
    });

    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT'))).toEqual({
      en: 'they eat.',
      it: 'mangiano.',
      fr: 'ils mangent.',
      es: 'comen.',
      pt: 'comem.',
      de: 'sie essen.',
      ja: '彼らは食べます。',
    });
  });
});

// A98. A specific human direct object takes the preposition "a" in Spanish ("ve al niño", "mata a un
// hombre"). `predicateText` renders every noun object with `npText`, so the "a" is never there. The
// corpus already marks personhood (`human`, surfaced on the forms since A7).
describe('known bugs: Spanish personal "a"', () => {
  test('Spanish marks a human direct object with "a"', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOY') })).es).toBe('el gato ve al niño.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('WOMAN') })).es).toBe('el gato ve a la mujer.');
    expect(sayAll(clause(np('CAT'), 'KILL', { directObject: np('MAN', { definiteness: 'indefinite' }) })).es)
      .toBe('el gato mata a un hombre.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOY', { definiteness: 'no' }) })).es)
      .toBe('el gato no ve a ningún niño.');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'SEE' }, directObject: np('BOY') } }), 'RUN')).es)
      .toBe('el perro que ve al niño corre.');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'LOVE', { directObject: np('CHILD') }), imperative: true }).es)
      .toBe('ama al niño.');
  });

  test('Spanish marks the plural, a quantifier, a demonstrative, a possessive, a group and the infinitive', () => {
    const sees = (directObject: NonNullable<Parameters<typeof clause>[2]>['directObject']) => sayAll(clause(np('CAT'), 'SEE', { directObject })).es;
    expect(sees(np('MAN', { number: 'plural' }))).toBe('el gato ve a los hombres.');
    expect(sees(np('PERSON', { number: 'plural', definiteness: 'some' }))).toBe('el gato ve a algunas personas.');
    expect(sees(np('WOMAN', { definiteness: 'this' }))).toBe('el gato ve a esta mujer.');
    expect(sees(np('FATHER', { possessor: { kind: 'pronominal', person: '3', number: 'singular' } }))).toBe('el gato ve a su padre.');
    expect(sees(np('FATHER', { possessor: np('BOY') }))).toBe('el gato ve al padre del niño.');
    expect(sees(np('MAN', { adjectives: ['OLD'] }))).toBe('el gato ve al hombre viejo.');
    expect(sees({ conjuncts: [np('BOY'), np('WOMAN')], conjunction: 'and' })).toBe('el gato ve al niño y a la mujer.');
    expect(sayAll({ ...clause(np('GENERIC_PERSON'), 'LOVE', { directObject: np('CHILD') }), infinitive: true }).es).toBe('amar al niño.');
  });

  test('Spanish keeps the impersonal se singular before the personal "a"', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('BOY', { number: 'plural' }) })).es).toBe('se ve a los niños.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: { conjuncts: [np('THIRD_PERSON'), np('FIRST_PERSON')], conjunction: 'and' } })).es)
      .toBe('se nos ve a él y a mí.');
  });

  test('regression: a bare human, an animal, a thing and the passive se keep their forms', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('BOY', { number: 'plural', definiteness: 'bare' }) })).es).toBe('el gato ve niños.');
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('DOG') })).es).toBe('el gato ve el perro.');
    expect(sayAll(clause(np('GENERIC_PERSON'), 'SEE', { directObject: np('HOUSE', { number: 'plural' }) })).es).toBe('se ven las casas.');
    expect(sayAll(clause(np('CAT'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('BOY') } } })).es).toBe('el gato da el libro al niño.');
  });
});

// A120. BE with no complement at all ("the cat is", "Antarctica will not be") takes neither the copula
// path, which needs a predicative, nor A109's existential, which needs a locative. It falls through to
// the ordinary verb path on BE's fallback lexeme です, which has no stem, so the tense and polarity are
// lost and the modal, aspect, command and relative glue onto it: 猫はです, 猫はですことができます,
// ですください. The existential いる / ある already carries every form.
describe('known bugs: Japanese BE with no complement', () => {
  test.fails('Japanese renders a bare BE as the existential いる / ある', () => {
    const be = (subject: string, verbPhrase: Partial<VerbPhrase> = {}) =>
      sayAll(clause(np(subject), 'BE', { verbPhrase })).ja;
    expect(be('CAT')).toBe('猫はいます。');
    expect(be('BOOK')).toBe('本はあります。');
    expect(be('CAT', { negative: true })).toBe('猫はいません。');
    expect(be('CAT', { tense: 'past' })).toBe('猫はいました。');
    expect(be('CAT', { tense: 'past', negative: true })).toBe('猫はいませんでした。');
    expect(be('ANTARCTICA', { tense: 'future', negative: true })).toBe('南極大陸はありません。');
    expect(be('CAT', { modals: ['CAN'] })).toBe('猫はいることができます。');
    expect(be('CAT', { aspect: 'progressive' })).toBe('猫はいます。');
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BE'), imperative: true }).ja).toBe('いてください。');
    expect(sayAll(clause(np('DOG', { relative: { verbPhrase: { verb: 'BE' } } }), 'RUN')).ja).toBe('いる犬は走ります。');
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'BE') }).ja).toBe('もし猫がいたら、犬は走ります。');
  });
});
