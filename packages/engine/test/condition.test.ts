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

describe('documented simplifications: conditionals', () => {
  // Deliberate: de.ts calls verb-final ordering in the "wenn" clause "a documented
  // approximation". Recorded here as the correct target, not as an oversight.
  //
  // German gets both halves of the word order wrong. A subordinate "wenn" clause is verb-final
  // ("wenn der Kater essen würde"), and a main clause that FOLLOWS a fronted subordinate clause
  // inverts, because the subordinate clause occupies the first position ("würde der Hund
  // laufen"). The engine emits main-clause order in the protasis and no inversion in the
  // apodosis: "wenn der Kater würde essen, der Hund würde laufen."
  test.fails('German conditionals need verb-final protasis and an inverted apodosis', () => {
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'EAT') }))
      .toMatchObject({ de: 'wenn der Kater essen würde, würde der Hund laufen.' });
  });
});
