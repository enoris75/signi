import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from './harness.js';

// Relative clauses and coordination compose: a conjunct is a noun phrase, so it can carry its own
// relative clause, and a relative clause's object is a noun phrase, so it can be a coordinated
// group. Each feature is covered on its own (relative.test.ts, coordination.test.ts); this file
// pins the intersection — the group agreement, the German comma-bracketing and the Japanese plain
// form all have to keep holding when the two nest.
describe('relative × coordination', () => {
  test('one conjunct of the subject group carries a relative clause', () => {
    // The relative sits on the first conjunct only; the group is still two nouns, so the verb is
    // plural. German brackets just that conjunct's clause in commas.
    expect(sayAll(clause(
      { conjuncts: [np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), np('DOG')], conjunction: 'and' },
      'RUN',
    ))).toEqual({
      en: 'the cat that eats and the dog run.',
      it: 'il gatto che mangia e il cane corrono.',
      fr: 'le chat qui mange et le chien courent.',
      es: 'el gato que come y el perro corren.',
      pt: 'o gato que come e o cão correm.',
      de: 'der Kater, der isst, und der Hund laufen.',
      ja: '食べる猫と犬は走ります。', // plain 食べる on the relative, and と joins the group
    });
  });

  test('a disjunction of the same group agrees in the singular', () => {
    expect(sayAll(clause(
      { conjuncts: [np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), np('DOG')], conjunction: 'or' },
      'RUN',
    ))).toMatchObject({
      en: 'the cat that eats or the dog runs.', // singular "runs"
      it: 'il gatto che mangia o il cane corre.',
      de: 'der Kater, der isst, oder der Hund läuft.',
      ja: '食べる猫か犬は走ります。',
    });
  });

  test('the relative clause on the conjunct carries its own tense', () => {
    expect(sayAll(clause(
      { conjuncts: [np('CAT', { relative: { verbPhrase: { verb: 'EAT', tense: 'past' } } }), np('DOG')], conjunction: 'and' },
      'RUN',
    ))).toMatchObject({
      en: 'the cat that ate and the dog run.', // relative past, matrix present
      it: 'il gatto che mangiò e il cane corrono.',
      de: 'der Kater, der aß, und der Hund laufen.',
      ja: '食べた猫と犬は走ります。', // plain past inside the relative
    });
  });

  test('a relative clause with a coordinated direct object', () => {
    // The coordinated group is the object OF the relative clause; the matrix subject is one cat, so
    // the matrix verb stays singular. German keeps the clause verb-final behind both objects.
    expect(sayAll(clause(
      np('CAT', {
        relative: {
          verbPhrase: { verb: 'EAT' },
          directObject: { conjuncts: [np('MOUSE'), np('FOOD')], conjunction: 'and' },
        },
      }),
      'RUN',
    ))).toEqual({
      en: 'the cat that eats the mouse and the food runs.', // singular "runs"
      it: 'il gatto che mangia il topo e il cibo corre.',
      fr: 'le chat qui mange la souris et la nourriture court.',
      es: 'el gato que come el ratón y la comida corre.',
      pt: 'o gato que come o rato e a comida corre.',
      de: 'der Kater, der die Maus und das Essen isst, läuft.',
      ja: 'ネズミと食べ物を食べる猫は走ります。',
    });
  });

  test('both matrix conjuncts carry a relative clause', () => {
    // Two relatives, two comma-bracketed clauses in German — nested without collision — and the
    // group is still plural ("jump" / "saltano" / "springen").
    expect(sayAll(clause(
      {
        conjuncts: [
          np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }),
          np('DOG', { relative: { verbPhrase: { verb: 'RUN' } } }),
        ],
        conjunction: 'and',
      },
      'JUMP',
    ))).toEqual({
      en: 'the cat that eats and the dog that runs jump.',
      it: 'il gatto che mangia e il cane che corre saltano.',
      fr: 'le chat qui mange et le chien qui court sautent.',
      es: 'el gato que come y el perro que corre saltan.',
      pt: 'o gato que come e o cão que corre pulam.',
      de: 'der Kater, der isst, und der Hund, der läuft, springen.',
      ja: '食べる猫と走る犬は跳びます。',
    });
  });

  test('a coordinated MATRIX object, one conjunct of which carries a relative', () => {
    expect(sayAll(clause(np('BOY'), 'SEE', {
      directObject: { conjuncts: [np('CAT', { relative: { verbPhrase: { verb: 'EAT' } } }), np('DOG')], conjunction: 'and' },
    }))).toMatchObject({
      en: 'the boy sees the cat that eats and the dog.',
      it: 'il ragazzo vede il gatto che mangia e il cane.',
      // German marks the accusative on both conjuncts and brackets the relative in commas.
      de: 'der Junge sieht den Kater, der isst, und den Hund.',
      ja: '男の子は食べる猫と犬を見ます。',
    });
  });
});
