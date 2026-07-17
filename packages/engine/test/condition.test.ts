import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from './harness.js';

// A counterfactual conditional: the plan is the main clause (apodosis, in the conditional mood)
// and `condition` is the "if" clause (protasis, in the past / imperfect subjunctive).
describe('conditionals', () => {
  test('the two clauses take different moods', () => {
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT') }))
      .toMatchObject({
        en: 'if the cat ate, the dog would run.',
        // Romance: imperfect subjunctive in the protasis, conditional in the apodosis.
        it: 'se il gatto mangiasse, il cane correrebbe.',
        fr: 'si le chat mangeait, le chien courrait.',
        es: 'si el gato comiera, el perro correría.',
        pt: 'se o gato comesse, o cão correria.',
        ja: 'もし猫が食べたら、犬は走ります。',
      });
  });

  test('both clauses keep their own objects', () => {
    expect(sayAll({
      ...clause(np('DOG'), 'SEE', { directObject: np('MOUSE') }),
      condition: clause(np('CAT'), 'EAT', { directObject: np('BOOK') }),
    })).toMatchObject({
      en: 'if the cat ate the book, the dog would see the mouse.',
      it: 'se il gatto mangiasse il libro, il cane vedrebbe il topo.',
      fr: 'si le chat mangeait le livre, le chien verrait la souris.',
      es: 'si el gato comiera el libro, el perro vería el ratón.',
    });
  });
});

describe('German conditional word order', () => {
  // A subordinate "wenn" clause is verb-final ("wenn der Kater essen würde"), and the main clause
  // that FOLLOWS a fronted subordinate inverts, because the subordinate occupies the first
  // position and pushes the finite verb ahead of the subject ("würde der Hund laufen"). Was B03.
  test('the "wenn" clause is verb-final and the main clause inverts after it', () => {
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT') }))
      .toMatchObject({ de: 'wenn der Kater essen würde, würde der Hund laufen.' });
  });

  // Both clauses keep their objects, and the protasis object sits in the Mittelfeld of the
  // verb-final clause, before the infinitive+finite tail: "wenn der Kater das Buch essen würde".
  test('objects sit in the Mittelfeld of the verb-final protasis', () => {
    expect(sayAll({
      ...clause(np('DOG'), 'SEE', { directObject: np('MOUSE') }),
      condition: clause(np('CAT'), 'EAT', { directObject: np('BOOK') }),
    })).toMatchObject({
      de: 'wenn der Kater das Buch essen würde, würde der Hund die Maus sehen.',
    });
  });
});
