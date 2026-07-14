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

// DELIBERATE, not oversights — do not "fix" without a product decision.
//
// English and German collapse the negative sentiment onto the neutral connector: en.ts notes
// English has no distinct one (the blame sense "rides on 'because of' itself"), and de.ts notes
// the "durch … Schuld" periphrasis is not built.
//
// Worth weighing, though: the other five languages DO distinguish it, so the stance the user
// picked is silently lost in exactly two of the seven — the negative renders as the neutral.
describe('documented simplifications: cause', () => {
  test.fails('English collapses the negative sentiment onto "because of"', () => {
    expect(criesBecauseOf('negative'))
      .toMatchObject({ en: 'the cat cries through the fault of the dog.' });
  });

  test.fails('German collapses the negative sentiment onto "wegen"', () => {
    expect(criesBecauseOf('negative'))
      .toMatchObject({ de: 'der Kater weint durch die Schuld des Hundes.' });
  });
});
