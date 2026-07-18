import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from '../harness.js';

// A clause may license more than one complement at once — the same verb can say *what it acted
// with* and *where it acted*, together. The per-complement suites each pin one marking in
// isolation; this file pins what happens when two share a sentence.
//
// The engine lays them out in a fixed linear order — `COMPLEMENT_RENDER_ORDER` in @signi/shared —
// not the order the plan's keys happen to be written in. `instrumental` precedes `locative`, which
// precedes `cause`. Each complement keeps exactly the marking its own suite pins; they simply
// abut. Japanese is the one language that stacks its particles visibly, so both a で-marked
// instrument and a で-marked place sit before the verb ("棒で家で切ります").
describe('two complements in one clause', () => {
  test('instrumental then locative — "with the stick in the house"', () => {
    expect(sayAll(clause(np('CAT'), 'CUT', {
      complements: {
        instrumental: { phrase: np('STICK'), specifiers: [{ kind: 'abstraction', value: 'object' }] },
        locative: { phrase: np('HOUSE') },
      },
    }))).toEqual({
      en: 'the cat cuts with the stick in the house.',
      it: 'il gatto taglia con il bastone nella casa.',
      fr: 'le chat coupe avec le bâton dans la maison.',
      es: 'el gato corta con el palo en la casa.',
      pt: 'o gato corta com o pau na casa.',
      de: 'der Kater schneidet mit dem Stock im Haus.',
      ja: '猫は棒で家で切ります。', // both instruments and place take で, and both precede the verb
    });
  });

  test('the direct object keeps its slot, ahead of both complements', () => {
    // Object, then instrument, then place — the object sits where the transitive verb puts it, and
    // the two complements follow in render order. Japanese alone re-sorts it: the で-marked
    // adjuncts lead, and the を-marked object drops in right before the verb.
    expect(sayAll(clause(np('CAT'), 'CUT', {
      directObject: np('BOOK'),
      complements: {
        instrumental: { phrase: np('STICK'), specifiers: [{ kind: 'abstraction', value: 'object' }] },
        locative: { phrase: np('HOUSE') },
      },
    }))).toEqual({
      en: 'the cat cuts the book with the stick in the house.',
      it: 'il gatto taglia il libro con il bastone nella casa.',
      fr: 'le chat coupe le livre avec le bâton dans la maison.',
      es: 'el gato corta el libro con el palo en la casa.',
      pt: 'o gato corta o livro com o pau na casa.',
      de: 'der Kater schneidet das Buch mit dem Stock im Haus.',
      ja: '猫は棒で家で本を切ります。',
    });
  });

  test('locative then cause — "in the house because of the dog"', () => {
    expect(sayAll(clause(np('CAT'), 'CRY', {
      complements: {
        locative: { phrase: np('HOUSE') },
        cause: { phrase: np('DOG') },
      },
    }))).toEqual({
      en: 'the cat cries in the house because of the dog.',
      it: 'il gatto piange nella casa a causa del cane.',
      fr: 'le chat pleure dans la maison à cause du chien.',
      es: 'el gato llora en la casa a causa del perro.',
      pt: 'o gato chora na casa por causa do cão.',
      de: 'der Kater weint im Haus wegen dem Hund.',
      ja: '猫は家で犬のために泣きます。',
    });
  });

  // The order the sentence comes out in is the engine's, not the caller's: `COMPLEMENT_RENDER_ORDER`
  // puts the locative before the cause no matter which key was written first. Here the plan lists
  // `cause` ahead of `locative`, and the output is still "in the house because of the dog" —
  // identical to the test above.
  test('render order is fixed by the engine, not by the order the keys are written', () => {
    const causeFirst = sayAll(clause(np('CAT'), 'CRY', {
      complements: {
        cause: { phrase: np('DOG') },
        locative: { phrase: np('HOUSE') },
      },
    }));
    const locativeFirst = sayAll(clause(np('CAT'), 'CRY', {
      complements: {
        locative: { phrase: np('HOUSE') },
        cause: { phrase: np('DOG') },
      },
    }));
    expect(causeFirst).toEqual(locativeFirst);
    expect(causeFirst.en).toBe('the cat cries in the house because of the dog.');
  });
});
