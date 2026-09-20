import { describe, expect, test } from 'vitest';
import { complement, complements, np } from '../resolved.fixtures.js';
import { splitObjectPredicative } from './splitObjectPredicative.js';

const PRISON = { base: '刑務所' };
const HOUSE = { base: '家' };

describe('splitObjectPredicative', () => {
  test('passes everything through when there is no object complement', () => {
    const map = complements({ locative: complement(np(HOUSE)) });
    expect(splitObjectPredicative(map)).toEqual({ rest: map });
    expect(splitObjectPredicative(undefined)).toEqual({ rest: undefined });
  });

  test('splits it out, so the clause can put it after the を it predicates of', () => {
    const objectPredicative = complement(np(PRISON));
    const locative = complement(np(HOUSE));
    expect(splitObjectPredicative(complements({ objectPredicative, locative }))).toEqual({
      objectPredicative: { objectPredicative },
      rest: { locative },
    });
  });
});
