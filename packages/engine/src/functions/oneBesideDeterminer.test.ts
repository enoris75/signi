import { describe, expect, test } from 'vitest';
import { oneBesideDeterminer } from './oneBesideDeterminer.js';

describe('oneBesideDeterminer', () => {
  test('one beside the definite or a demonstrative', () => {
    expect(oneBesideDeterminer({ numeral: '1' })).toBe(true);
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'definite' })).toBe(true);
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'this' })).toBe(true);
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'that' })).toBe(true);
  });

  test('not the bare one the indefinite resolves to, another value, another determiner or no numeral', () => {
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'bare' })).toBe(false);
    expect(oneBesideDeterminer({ numeral: '2', definiteness: 'definite' })).toBe(false);
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'no' })).toBe(false);
    expect(oneBesideDeterminer({ definiteness: 'definite' })).toBe(false);
  });

  // A365: a pronominal possessive stands in a bare head's determiner, but not in the indefinite's.
  test('one beside a bare head with a pronominal possessive, not the dropped indefinite', () => {
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'bare' }, true)).toBe(true);
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'bare', indefinite_dropped: '1' }, true)).toBe(false);
    expect(oneBesideDeterminer({ numeral: '2', definiteness: 'bare' }, true)).toBe(false);
    expect(oneBesideDeterminer({ numeral: '1', definiteness: 'no' }, true)).toBe(false);
  });
});
