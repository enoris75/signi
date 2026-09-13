import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import { complement, complements, HAUS, MESSER, np, vp, WAEHLEN, WORT } from './de.fixtures.js';
import { splitMeansClause } from './splitMeansClause.js';

const asProcess: Specifier = { kind: 'abstraction', value: 'process' };
const asConcept: Specifier = { kind: 'abstraction', value: 'concept' };

describe('splitMeansClause', () => {
  test('splits out a process instrument as the means clause', () => {
    // "…, indem … ein Wort wählt": a subordinate clause, so it trails the whole clause.
    const instrumental = complement(np(WORT, { definiteness: 'indefinite' }), [asProcess], vp(WAEHLEN));
    const locative = complement(np(HAUS));
    expect(splitMeansClause(complements({ instrumental, locative }))).toEqual({
      means: { instrumental },
      rest: { locative },
    });
  });

  test('leaves a plain instrument phrase among the rest', () => {
    const map = complements({ instrumental: complement(np(MESSER)), locative: complement(np(HAUS)) });
    expect(splitMeansClause(map)).toEqual({ rest: map });
    expect(splitMeansClause(undefined)).toEqual({ rest: undefined });
  });

  test('leaves a concept-level instrument, or a process with no action, among the rest', () => {
    const conceptLevel = complements({ instrumental: complement(np(WORT), [asConcept], vp(WAEHLEN)) });
    expect(splitMeansClause(conceptLevel)).toEqual({ rest: conceptLevel });
    const noAction = complements({ instrumental: complement(np(WORT), [asProcess]) });
    expect(splitMeansClause(noAction)).toEqual({ rest: noAction });
  });
});
