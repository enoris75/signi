import { describe, expect, test } from 'vitest';
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
    expect(sayAll(clause(np('FIRST_PERSON'), 'EAT'))).toEqual({
      en: 'I eat.',
      it: 'io mangio.',
      fr: 'je mange.',
      es: 'yo como.',
      pt: 'eu como.',
      de: 'ich esse.',
      ja: '私は食べます。',
    });

    expect(sayAll(clause(np('THIRD_PERSON', { number: 'plural' }), 'EAT'))).toEqual({
      en: 'they eat.',
      it: 'loro mangiano.',
      fr: 'ils mangent.',
      es: 'ellos comen.',
      pt: 'eles comem.',
      de: 'sie essen.',
      ja: '彼らは食べます。',
    });
  });
});
