import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// Coordinated nouns. Where the comma falls and whether the conjunction repeats is a fact about
// each language, so the engines do the joining; each conjunct keeps its own determiner, which
// is what Romance needs ("il gatto **e il** cane").
describe('coordinated noun groups', () => {
  test('two conjuncts, and the verb agrees with the pair', () => {
    expect(sayAll(clause({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' }, 'RUN')))
      .toEqual({
        en: 'the cat and the dog run.', // plural agreement
        it: 'il gatto e il cane corrono.', // the article repeats
        fr: 'le chat et le chien courent.',
        es: 'el gato y el perro corren.',
        pt: 'o gato e o cão correm.',
        de: 'der Kater und der Hund laufen.',
        ja: '猫と犬は走ります。',
      });
  });

  test('three conjuncts take a comma, and the conjunction does not repeat', () => {
    expect(sayAll(clause(
      { conjuncts: [np('CAT'), np('DOG'), np('MOUSE')], conjunction: 'and' },
      'RUN',
    ))).toMatchObject({
      en: 'the cat, the dog and the mouse run.',
      it: 'il gatto, il cane e il topo corrono.',
      fr: 'le chat, le chien et la souris courent.',
      de: 'der Kater, der Hund und die Maus laufen.',
      // Japanese repeats と between every conjunct instead.
      ja: '猫と犬とネズミは走ります。',
    });
  });

  test('a disjunction agrees in the singular', () => {
    expect(sayAll(clause({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'or' }, 'RUN')))
      .toMatchObject({
        en: 'the cat or the dog runs.',
        it: 'il gatto o il cane corre.',
        es: 'el gato o el perro corre.',
        de: 'der Kater oder der Hund läuft.',
      });
  });

  test('a coordinated direct object takes the object case throughout', () => {
    expect(sayAll(clause(np('BOY'), 'SEE', {
      directObject: { conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' },
    }))).toMatchObject({
      en: 'the boy sees the cat and the dog.',
      // German marks the accusative on both conjuncts.
      de: 'der Junge sieht den Kater und den Hund.',
      ja: '男の子は猫と犬を見ます。',
    });
  });
});

// Two independent clauses joined by a conjunction. Symmetric, unlike a condition.
describe('coordinated clauses', () => {
  test('copulative and adversative', () => {
    const join = (conjunction: 'and' | 'but') =>
      sayAll({
        ...clause(np('CAT'), 'RUN'),
        coordination: { conjunction, clause: clause(np('DOG'), 'JUMP') },
      });

    expect(join('and')).toMatchObject({
      en: 'the cat runs, and the dog jumps.',
      it: 'il gatto corre, e il cane salta.',
      de: 'der Kater läuft, und der Hund springt.',
    });
    expect(join('but')).toMatchObject({
      en: 'the cat runs, but the dog jumps.',
      it: 'il gatto corre, ma il cane salta.',
      es: 'el gato corre, pero el perro salta.',
      de: 'der Kater läuft, aber der Hund springt.',
    });
  });

  test('a conclusive conjunction inverts the German clause it introduces', () => {
    expect(sayAll({
      ...clause(np('CAT'), 'RUN'),
      coordination: { conjunction: 'therefore', clause: clause(np('DOG'), 'JUMP') },
    })).toMatchObject({
      en: 'the cat runs, so the dog jumps.',
      it: 'il gatto corre, quindi il cane salta.',
      fr: 'le chat court, donc le chien saute.',
      // "also" is a V2 adverb: the finite verb comes before the subject.
      de: 'der Kater läuft, also springt der Hund.',
    });
  });
});

// Two commands coordinate ("eat the bread, then run!"), but a statement and a command do not: a
// symmetric join means both halves carry the same illocutionary force. So the mood belongs to the
// PAIR, and an imperative hands its mood, its register and its addressee down to the clause it
// coordinates with.
describe('coordinated clauses: two imperatives', () => {
  const command = (verb: string, directObject?: string): PhrasePlan => ({
    ...clause(np('SECOND_PERSON'), verb, directObject ? { directObject: np(directObject) } : {}),
    imperative: true,
  });

  const joined = (conjunction: 'and' | 'then' | 'but' | 'or') => sayAll({
    ...command('EAT', 'FOOD'),
    coordination: { conjunction, clause: command('RUN') },
  });

  test('both clauses render as commands', () => {
    expect(joined('and')).toEqual({
      en: 'eat the food, and run.',
      it: 'mangia il cibo, e corri.',
      fr: 'mange la nourriture, et cours.',
      es: 'come la comida, y corre.',
      pt: 'coma a comida, e corra.',
      de: 'iss das Essen, und lauf.',
      ja: '食べ物を食べてください、そして走ってください。',
    });
  });

  test('each conjunction a command may take', () => {
    // Only these four: `therefore` and `that_is` relate propositions, and a command asserts
    // nothing to relate — see IMPERATIVE_COORD_CONJUNCTIONS.
    expect(joined('then')).toMatchObject({
      en: 'eat the food, and then run.',
      it: 'mangia il cibo, e poi corri.',
      de: 'iss das Essen, und dann lauf.',
      ja: '食べ物を食べてください、それから走ってください。',
    });
    expect(joined('but')).toMatchObject({
      en: 'eat the food, but run.',
      es: 'come la comida, pero corre.',
      de: 'iss das Essen, aber lauf.',
    });
    expect(joined('or')).toMatchObject({
      en: 'eat the food, or run.',
      it: 'mangia il cibo, o corri.',
      de: 'iss das Essen, oder lauf.',
    });
  });

  test('the register is handed down as well as the mood', () => {
    // An `instruction` parent makes the coordinated clause an instruction too: both go to the
    // infinitive in French/Spanish/German, and both to the verbal noun in Japanese.
    expect(sayAll({
      ...command('EAT', 'FOOD'),
      imperativeRegister: 'instruction',
      coordination: { conjunction: 'then', clause: command('RUN') },
    })).toMatchObject({
      fr: 'manger la nourriture, et puis courir.',
      es: 'comer la comida, y luego correr.',
      de: 'das Essen essen, und dann laufen.',
      ja: '食べ物を食べ、それから走り。',
    });
  });

  test('the addressee is the parent\'s, not the coordinated clause\'s', () => {
    // The second clause names a 2nd-PLURAL addressee, and it is ignored: the command stays 2sg
    // ("corri", not "correte"). One pair, one addressee.
    expect(sayAll({
      ...command('EAT', 'FOOD'),
      coordination: {
        conjunction: 'and',
        clause: { ...clause(np('SECOND_PERSON', { number: 'plural' }), 'RUN'), imperative: true },
      },
    })).toMatchObject({
      it: 'mangia il cibo, e corri.',
      fr: 'mange la nourriture, et cours.',
      de: 'iss das Essen, und lauf.',
    });
  });
});

// Mixing the moods. The pair's mood is the PARENT's, and the coordinated clause is coerced to it
// — in both directions. Neither is an error; the translator normalises rather than refusing.
describe('coordinated clauses: an imperative and an indicative', () => {
  const eatCommand: PhrasePlan = {
    ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('FOOD') }),
    imperative: true,
  };
  const runStatement: PhrasePlan = clause(np('SECOND_PERSON'), 'RUN');

  test('an imperative parent COERCES an unflagged clause into a command', () => {
    // The coordinated clause is a plain indicative plan — no `imperative` flag — and it still
    // comes out as a command, subject dropped. Identical to flagging it.
    const coerced = sayAll({
      ...eatCommand,
      coordination: { conjunction: 'and', clause: runStatement },
    });

    expect(coerced).toMatchObject({
      en: 'eat the food, and run.', // not "and you run"
      it: 'mangia il cibo, e corri.',
      de: 'iss das Essen, und lauf.',
      ja: '食べ物を食べてください、そして走ってください。',
    });

    expect(coerced).toEqual(sayAll({
      ...eatCommand,
      coordination: {
        conjunction: 'and',
        clause: { ...runStatement, imperative: true },
      },
    }));
  });

  test('…and it discards the coordinated clause\'s own subject', () => {
    // The second clause names the CAT as its subject. An imperative has no third-person
    // addressee, so the subject is dropped and the parent's addressee governs.
    expect(sayAll({
      ...eatCommand,
      coordination: { conjunction: 'and', clause: clause(np('CAT'), 'RUN') },
    })).toMatchObject({
      en: 'eat the food, and run.', // not "and the cat runs"
      it: 'mangia il cibo, e corri.',
    });
  });

  test('an INDICATIVE parent coerces the other way — the command becomes a statement', () => {
    // Symmetric: the coordinated clause is flagged `imperative`, and the flag is ignored. The
    // subject comes back, and both halves conjugate as statements.
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', { directObject: np('FOOD') }),
      coordination: {
        conjunction: 'and',
        clause: { ...runStatement, imperative: true },
      },
    })).toEqual({
      en: 'you eat the food, and you run.',
      it: 'tu mangi il cibo, e tu corri.',
      fr: 'tu manges la nourriture, et tu cours.',
      es: 'tú comes la comida, y tú corres.',
      pt: 'você come a comida, e você corre.',
      de: 'du isst das Essen, und du läufst.',
      ja: 'あなたは食べ物を食べます、そしてあなたは走ります。',
    });
  });

  test('a conjunction a command may not take is rewritten, even on a mixed pair', () => {
    expect(sayAll({
      ...eatCommand,
      coordination: { conjunction: 'therefore', clause: runStatement },
    })).toMatchObject({
      en: 'eat the food, and run.', // "therefore" → "and"
      de: 'iss das Essen, und lauf.',
    });
  });
});
