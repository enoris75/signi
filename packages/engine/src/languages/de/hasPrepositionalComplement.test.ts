import { describe, expect, test } from 'vitest';
import type { AbstractionLevel, Specifier } from '@signi/shared';
import { BEHAELTER, complement, complements, HAUS, MANN, MESSER, MUEDE, np, vp, WAEHLEN, WORT } from './de.fixtures.js';
import { hasPrepositionalComplement } from './hasPrepositionalComplement.js';

const abstraction = (value: AbstractionLevel): Specifier => ({ kind: 'abstraction', value });

describe('hasPrepositionalComplement', () => {
  test('nothing to lead when there are no complements', () => {
    expect(hasPrepositionalComplement(undefined)).toBe(false);
    expect(hasPrepositionalComplement(complements({}))).toBe(false);
  });

  test('the complements that take a preposition', () => {
    // "im Haus", "zum Haus", "aus dem Haus", "um das Haus", "mit dem Messer", "wegen dem Mann".
    for (const type of ['locative', 'direction', 'source', 'route', 'instrumental', 'cause', 'manner'] as const) {
      expect(hasPrepositionalComplement(complements({ [type]: complement(np(HAUS)) }))).toBe(true);
    }
  });

  test('a predicate complement is a bare nominative, not a PP', () => {
    // "wird müde", "ist eine Legende" — "nicht" leads it, but the caller asks for that separately.
    expect(hasPrepositionalComplement(complements({ predicative: complement(np(MUEDE)) }))).toBe(false);
  });

  test('the terminus splits on animacy', () => {
    // An animate recipient is the bare dative "gibt dem Mann das Buch"; an inanimate goal is a
    // destination, "speichert das Buch in den Behälter".
    expect(hasPrepositionalComplement(complements({ terminus: complement(np(MANN)) }))).toBe(false);
    expect(hasPrepositionalComplement(complements({ terminus: complement(np(BEHAELTER)) }))).toBe(true);
  });

  test('a process instrumental is a means clause in the Nachfeld, not a PP', () => {
    // ", indem man ein Wort wählt" sits behind the verb; "mit dem Wählen eines Wortes" does not.
    expect(hasPrepositionalComplement(complements({
      instrumental: complement(np(WORT), [abstraction('process')], vp(WAEHLEN)),
    }))).toBe(false);
    expect(hasPrepositionalComplement(complements({
      instrumental: complement(np(WORT), [abstraction('concept')], vp(WAEHLEN)),
    }))).toBe(true);
    expect(hasPrepositionalComplement(complements({ instrumental: complement(np(MESSER)) }))).toBe(true);
  });

  test('one PP among several complements is enough', () => {
    expect(hasPrepositionalComplement(complements({
      terminus: complement(np(MANN)), locative: complement(np(HAUS)),
    }))).toBe(true);
  });
});
