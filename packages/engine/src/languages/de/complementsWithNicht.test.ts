import { describe, expect, test } from 'vitest';
import type { Specifier } from '@signi/shared';
import { complementsWithNicht } from './complementsWithNicht.js';
import { complement, complements, HAUS, KATER, KATZE, MANN, MUEDE, np, SCHEINEN } from './de.fixtures.js';

const ERSTE = { role: 'adjective', base: 'erste', ordinal: '1' };
const essive: Specifier = { kind: 'predication', value: 'essive' };
const deniedCause = { ...complement(np(MANN)), negative: true };

describe('complementsWithNicht', () => {
  test('renders only the lead and "nicht" without complements', () => {
    expect(complementsWithNicht([], undefined, {}, '')).toBe('');
    expect(complementsWithNicht([], undefined, {}, 'nicht')).toBe('nicht');
    expect(complementsWithNicht(['da'], {}, {}, 'nicht')).toBe('nicht da');
  });

  // A159: "nicht" leads the complements, which stand behind it.
  test('"nicht" leads the adjuncts, and the lead goes with them', () => {
    const inHouse = complements({ locative: complement(np(HAUS)) });
    expect(complementsWithNicht([], inHouse, {}, 'nicht')).toBe('nicht im Haus');
    expect(complementsWithNicht(['da'], inHouse, {}, 'nicht')).toBe('nicht da im Haus');
    expect(complementsWithNicht([], inHouse, {}, '')).toBe('im Haus');
  });

  // A186: a predicate closes the Mittelfeld, and sentence negation stands right before it.
  test('with a predicate "nicht" stands between the adjuncts and the predicate', () => {
    const tired = complements({ predicative: complement(np(MUEDE)), cause: complement(np(MANN)) });
    expect(complementsWithNicht([], tired, {}, 'nicht')).toBe('wegen des Mannes nicht müde');
    expect(complementsWithNicht(['da'], tired, {}, 'nicht')).toBe('da wegen des Mannes nicht müde');
    expect(complementsWithNicht([], tired, SCHEINEN, 'nicht')).toBe('wegen des Mannes nicht müde');
    expect(complementsWithNicht([], complements({ predicative: complement(np(MUEDE)) }), {}, 'nicht')).toBe('nicht müde');
    expect(complementsWithNicht([], tired, {}, '')).toBe('wegen des Mannes müde');
  });

  test('a denied cause keeps its own "nicht" apart from the clause\'s ahead of a predicate', () => {
    const tired = complements({ predicative: complement(np(MUEDE)), cause: deniedCause });
    expect(complementsWithNicht([], tired, {}, 'nicht')).toBe('nicht wegen des Mannes nicht müde');
    expect(complementsWithNicht([], tired, {}, '')).toBe('nicht wegen des Mannes müde');
  });

  test('without a predicate a denied cause\'s "nicht" carries the clause\'s too', () => {
    const notBecause = complements({ cause: deniedCause });
    expect(complementsWithNicht([], notBecause, {}, 'nicht')).toBe('nicht wegen des Mannes');
    expect(complementsWithNicht(['da'], notBecause, {}, 'nicht')).toBe('da nicht wegen des Mannes');
    expect(complementsWithNicht([], notBecause, {}, '')).toBe('nicht wegen des Mannes');
  });

  // A03: a clause denying two words of its verb group hands over two "nicht"; only one merges.
  test('of two clause "nicht", one merges with the denied cause\'s and the other stands', () => {
    expect(complementsWithNicht([], complements({ cause: deniedCause }), {}, 'nicht nicht')).toBe('nicht nicht wegen des Mannes');
  });

  test('a clause "nicht" is not merged into an adjunct that only begins with the letters', () => {
    const nichte = complements({ locative: complement(np({ base: 'Nichte', plural: 'Nichten', gender: 'fem', count: 'singular' }, { definiteness: 'bare' })) });
    expect(complementsWithNicht([], nichte, {}, 'nicht')).toBe('nicht in Nichte');
  });

  test('the predicate agrees with what it is said of, and an object predicate with the object', () => {
    const first = complements({ predicative: complement(np(ERSTE)) });
    expect(complementsWithNicht([], first, {}, 'nicht', KATZE)).toBe('nicht die Erste');
    expect(complementsWithNicht([], first, {}, 'nicht', KATER)).toBe('nicht der Erste');
    const asFirst = complements({ objectPredicative: complement(np(ERSTE), [essive]) });
    expect(complementsWithNicht([], asFirst, {}, 'nicht', KATZE, { agreement: KATER, case: 'acc' })).toBe('nicht als den Ersten');
  });
});
