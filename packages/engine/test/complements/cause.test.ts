import { describe, expect, test } from 'vitest';
import type { CauseSentiment } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

const criesBecauseOf = (value: CauseSentiment) =>
  sayAll(clause(np('CAT'), 'CRY', {
    complements: { cause: { phrase: np('DOG'), specifiers: [{ kind: 'sentiment', value }] } },
  }));

// Why the action happened. The cause carries a sentiment specifier — the affective stance the
// speaker takes to it: neutral ("because of"), negative ("fault of"), positive ("thanks to").
describe('cause', () => {
  test('neutral — "because of"', () => {
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG') } } })))
      .toMatchObject({
        en: 'the cat cries because of the dog.',
        it: 'il gatto piange a causa del cane.',
        fr: 'le chat pleure à cause du chien.',
        ja: '猫は犬のために泣きます。',
      });
  });

  test('positive — "thanks to"', () => {
    expect(criesBecauseOf('positive')).toMatchObject({
      en: 'the cat cries thanks to the dog.',
      it: 'il gatto piange grazie al cane.',
      fr: 'le chat pleure grâce au chien.',
      es: 'el gato llora gracias al perro.',
      de: 'der Kater weint dank dem Hund.',
      ja: '猫は犬のおかげで泣きます。',
    });
  });

  test('negative — "through the fault of"', () => {
    expect(criesBecauseOf('negative')).toMatchObject({
      it: 'il gatto piange per colpa del cane.',
      fr: 'le chat pleure par la faute du chien.',
      es: 'el gato llora por culpa del perro.',
      pt: 'o gato chora por culpa do cão.',
      ja: '猫は犬のせいで泣きます。',
    });
  });
});

// English and German now distinguish the negative sentiment too, so all seven languages carry the
// user's stance. English uses the "through the fault of" periphrasis; German the genitive "durch
// die Schuld" + the blamed party in the genitive ("durch die Schuld des Hundes"). Was B02.
describe('cause: the negative sentiment in English and German', () => {
  test('English lays blame with "through the fault of"', () => {
    expect(criesBecauseOf('negative'))
      .toMatchObject({ en: 'the cat cries through the fault of the dog.' });
  });

  test('German lays blame with the genitive "durch die Schuld"', () => {
    expect(criesBecauseOf('negative'))
      .toMatchObject({ de: 'der Kater weint durch die Schuld des Hundes.' });
  });

  // The genitive is the whole point of the German periphrasis, so exercise the article/ending
  // across gender and number: neuter "des Wortes", feminine "der Katze", plural "der Hunde".
  const blamedOn = (party: Parameters<typeof np>[0], opts?: Parameters<typeof np>[1]) =>
    sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np(party, opts), specifiers: [{ kind: 'sentiment', value: 'negative' }] } },
    }));

  test('German genitive declines for gender and number', () => {
    expect(blamedOn('WORD')).toMatchObject({ de: 'der Kater weint durch die Schuld des Wortes.' }); // neuter -es
    expect(blamedOn('MOUSE')).toMatchObject({ de: 'der Kater weint durch die Schuld der Maus.' }); // feminine, no ending
    expect(blamedOn('DOG', { number: 'plural' })).toMatchObject({ de: 'der Kater weint durch die Schuld der Hunde.' }); // plural
  });

  test('English "through the fault of" reaches a plural and an indefinite', () => {
    expect(blamedOn('DOG', { number: 'plural' })).toMatchObject({ en: 'the cat cries through the fault of the dogs.' });
    expect(blamedOn('DOG', { definiteness: 'indefinite' })).toMatchObject({ en: 'the cat cries through the fault of a dog.' });
  });

  // A pronoun cause carries the stance too: English reuses the connector ("through the fault of
  // him"); German the possessive periphrasis ("durch seine Schuld"), the possessive agreeing with
  // feminine "Schuld".
  const blamedOnPerson = (person: 'FIRST_PERSON' | 'SECOND_PERSON' | 'THIRD_PERSON', opts?: Parameters<typeof np>[1]) =>
    sayAll(clause(np('CAT'), 'CRY', {
      complements: { cause: { phrase: np(person, opts), specifiers: [{ kind: 'sentiment', value: 'negative' }] } },
    }));

  test('a negative pronoun cause: English connector, German possessive', () => {
    expect(blamedOnPerson('THIRD_PERSON')).toMatchObject({
      en: 'the cat cries through the fault of him.',
      de: 'der Kater weint durch seine Schuld.',
    });
    expect(blamedOnPerson('FIRST_PERSON')).toMatchObject({
      en: 'the cat cries through the fault of me.',
      de: 'der Kater weint durch meine Schuld.',
    });
    expect(blamedOnPerson('THIRD_PERSON', { gender: 'fem' })).toMatchObject({
      de: 'der Kater weint durch ihre Schuld.',
    });
  });

  // Regression: the neutral and positive connectors are untouched by the negative fix.
  test('neutral and positive connectors are unchanged', () => {
    expect(criesBecauseOf('positive')).toMatchObject({ en: 'the cat cries thanks to the dog.', de: 'der Kater weint dank dem Hund.' });
    expect(sayAll(clause(np('CAT'), 'CRY', { complements: { cause: { phrase: np('DOG') } } })))
      .toMatchObject({ en: 'the cat cries because of the dog.', de: 'der Kater weint wegen dem Hund.' });
  });
});
