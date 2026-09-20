import { describe, expect, test } from 'vitest';
import { complement, complements, group, np } from '../languages/resolved.fixtures.js';
import { withComplementDefiniteness } from './withComplementDefiniteness.js';

const HOUSE = { base: 'house' };
const MARKET = { base: 'market' };
const determiners = (c: ReturnType<typeof complements> | undefined, type: 'locative' | 'direction') =>
  c?.[type]?.phrase.conjuncts.map((np) => np.head.forms['definiteness']);

describe('withComplementDefiniteness', () => {
  test('nothing to switch', () => {
    expect(withComplementDefiniteness(undefined, 'any')).toBeUndefined();
    expect(withComplementDefiniteness({}, 'any')).toEqual({});
  });

  test('a `no` complement takes the given determiner', () => {
    const map = complements({ locative: complement(np(HOUSE, { definiteness: 'no' })) });
    expect(determiners(withComplementDefiniteness(map, 'any'), 'locative')).toEqual(['any']);
    expect(determiners(withComplementDefiniteness(map, 'indefinite'), 'locative')).toEqual(['indefinite']);
  });

  test('only the `no` conjuncts switch: "in the house or any market"', () => {
    const map = complements({
      locative: complement(group('or', np(HOUSE, { definiteness: 'definite' }), np(MARKET, { definiteness: 'no' }))),
    });
    expect(determiners(withComplementDefiniteness(map, 'any'), 'locative')).toEqual(['definite', 'any']);
  });

  test('only the `no` complements switch, across several', () => {
    const map = complements({
      locative: complement(np(HOUSE, { definiteness: 'no' })),
      direction: complement(np(MARKET, { definiteness: 'definite' })),
    });
    const out = withComplementDefiniteness(map, 'indefinite');
    expect(determiners(out, 'locative')).toEqual(['indefinite']);
    expect(determiners(out, 'direction')).toEqual(['definite']);
  });

  test('the original complements are left untouched', () => {
    const map = complements({ locative: complement(np(HOUSE, { definiteness: 'no' })) });
    withComplementDefiniteness(map, 'any');
    expect(determiners(map, 'locative')).toEqual(['no']);
  });
});
