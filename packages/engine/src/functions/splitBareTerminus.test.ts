import { describe, expect, test } from 'vitest';
import { complement, complements, np } from '../languages/resolved.fixtures.js';
import { splitBareTerminus } from './splitBareTerminus.js';

const MAN = { base: 'man', animate: '1' };
const KNIFE = { base: 'knife' };
const BARE = { base: 'ask', terminus_bare: '1' };
const PREPOSITIONAL = { base: 'say' };

describe('splitBareTerminus', () => {
  test('lifts the addressee out for a verb whose lexeme says terminus_bare', () => {
    const terminus = complement(np(MAN));
    const instrumental = complement(np(KNIFE));
    expect(splitBareTerminus(complements({ terminus, instrumental }), BARE))
      .toEqual({ bare: terminus, rest: { instrumental } });
  });

  test('a verb that takes "to" keeps its terminus among the complements', () => {
    const map = complements({ terminus: complement(np(MAN)) });
    expect(splitBareTerminus(map, PREPOSITIONAL)).toEqual({ rest: map });
    expect(splitBareTerminus(map)).toEqual({ rest: map });
  });

  test('passes everything through when there is no terminus', () => {
    const map = complements({ instrumental: complement(np(KNIFE)) });
    expect(splitBareTerminus(map, BARE)).toEqual({ rest: map });
    expect(splitBareTerminus(undefined, BARE)).toEqual({ rest: undefined });
  });
});
