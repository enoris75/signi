import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// All three at once: two coordinated commands, each with a relative clause on its object. The mood
// belongs to the PAIR (see coordination.test.ts), so both halves render as commands; each half's
// object may carry its own relative clause; and the relative clauses keep their subordinate shape
// (German comma-bracketing, Japanese plain form) inside it. This is the deepest composition of the
// three features, and nothing tests it below this file.
const command = (verb: string, object?: NounPhrase): PhrasePlan => ({
  ...clause(np('SECOND_PERSON'), verb, object ? { directObject: object } : {}),
  imperative: true,
});

const MOUSE_THAT_RUNS = np('MOUSE', { relative: { verbPhrase: { verb: 'RUN' } } });
const DOG_THAT_JUMPS = np('DOG', { relative: { verbPhrase: { verb: 'JUMP' } } });

describe('relative × coordination × imperative', () => {
  test('two commands, the first with a relative object', () => {
    expect(sayAll({
      ...command('EAT', MOUSE_THAT_RUNS),
      coordination: { conjunction: 'then', clause: command('JUMP') },
    })).toEqual({
      en: 'eat the mouse that runs, and then jump.',
      it: 'mangia il topo che corre, e poi salta.',
      fr: 'mange la souris qui court, et puis saute.',
      es: 'come el ratón que corre, y luego salta.',
      pt: 'coma o rato que corre, e depois pule.',
      de: 'iss die Maus, die läuft, und dann spring.',
      ja: '走るネズミを食べてください、それから跳んでください。',
    });
  });

  test('BOTH coordinated commands carry a relative object', () => {
    expect(sayAll({
      ...command('EAT', MOUSE_THAT_RUNS),
      coordination: { conjunction: 'and', clause: command('SEE', DOG_THAT_JUMPS) },
    })).toEqual({
      en: 'eat the mouse that runs, and see the dog that jumps.',
      it: 'mangia il topo che corre, e vedi il cane che salta.',
      fr: 'mange la souris qui court, et vois le chien qui saute.',
      es: 'come el ratón que corre, y ve el perro que salta.',
      pt: 'coma o rato que corre, e veja o cão que pula.',
      de: 'iss die Maus, die läuft, und sieh den Hund, der springt.',
      ja: '走るネズミを食べてください、そして跳ぶ犬を見てください。',
    });
  });

  test('a single command with a coordinated object, one conjunct relativised', () => {
    // The coordination is on the OBJECT of one command (not two clauses): "eat [the mouse that runs]
    // and [the food]". The command form and the relative clause coexist inside one clause.
    expect(sayAll({
      ...clause(np('SECOND_PERSON'), 'EAT', {
        directObject: { conjuncts: [MOUSE_THAT_RUNS, np('FOOD')], conjunction: 'and' },
      }),
      imperative: true,
    })).toEqual({
      en: 'eat the mouse that runs and the food.',
      it: 'mangia il topo che corre e il cibo.',
      fr: 'mange la souris qui court et la nourriture.',
      es: 'come el ratón que corre y la comida.',
      pt: 'coma o rato que corre e a comida.',
      de: 'iss die Maus, die läuft, und das Essen.',
      ja: '走るネズミと食べ物を食べてください。',
    });
  });
});
