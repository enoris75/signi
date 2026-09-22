import { describe, expect, test } from 'vitest';
import { complement, complements, ER, HAUS, MANN, MESSER, np } from './de.fixtures.js';
import { splitDative } from './splitDative.js';

describe('splitDative', () => {
  test('passes everything through when there is no terminus', () => {
    const map = complements({ instrumental: complement(np(MESSER)) });
    expect(splitDative(map)).toEqual({ rest: map });
    expect(splitDative(undefined)).toEqual({ rest: undefined });
  });

  test('splits out an animate recipient as the bare dative', () => {
    // "gibt dem Mann das Buch mit dem Messer": the recipient leads the object.
    const terminus = complement(np(MANN));
    const instrumental = complement(np(MESSER));
    expect(splitDative(complements({ terminus, instrumental }))).toEqual({
      dative: { terminus },
      rest: { instrumental },
    });
  });

  test('leaves an inanimate goal among the rest', () => {
    // "speichert das Buch in den Behälter": a destination, not a recipient.
    const map = complements({ terminus: complement(np(HAUS)), instrumental: complement(np(MESSER)) });
    expect(splitDative(map)).toEqual({ rest: map });
  });

  test('splits out a personal pronoun, and leaves a neuter one among the rest', () => {
    // "gibt ihm das Buch" (A229): a pronoun's forms carry no `animate`, so it is read off the tonic
    // forms, which count a person as one; the neuter pronoun stands for a thing.
    const terminus = complement(np(ER));
    expect(splitDative(complements({ terminus }))).toEqual({ dative: { terminus }, rest: {} });
    const map = complements({ terminus: complement(np(ER, { gender: 'neut' })) });
    expect(splitDative(map)).toEqual({ rest: map });
  });
});
