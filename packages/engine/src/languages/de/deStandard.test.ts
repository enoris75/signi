import { describe, expect, test } from 'vitest';
import { ER, GROSS, ICH, MANN, el, group, np } from './de.fixtures.js';
import { dePredAdj } from './dePredAdj.js';
import { deStandard as render } from './deStandard.js';
import type { ResolvedNounPhrase } from '../../types.js';

/** The renderer reads the compared adjective and its standard; these tests build them as one phrase. */
const deStandard = (np: ResolvedNounPhrase) => render(np.head, np.standard, 'nom');

const the = { definiteness: 'definite' };
const compared = (degree: string, standard = el(np(MANN, the))) =>
  np(GROSS, { degree, standard: '1' }, { standard });

describe('deStandard', () => {
  test('the comparatives take "als", the equative "wie", and the standard stays nominative', () => {
    expect(deStandard(compared('more'))).toBe('als der Mann');
    expect(deStandard(compared('less'))).toBe('als der Mann');
    expect(deStandard(compared('equally'))).toBe('wie der Mann');
  });

  test('a pronoun standard is nominative too, not the dative a preposition would give', () => {
    expect(deStandard(compared('more', el(np(ER))))).toBe('als er');
  });

  test('nothing without a standard', () => {
    expect(deStandard(np(GROSS, { degree: 'more' }))).toBe('');
  });

  test('the equative adverb is "so" before a standard and "gleich" without one', () => {
    expect(dePredAdj(compared('equally').head)).toBe('so groß');
    expect(dePredAdj(np(GROSS, { degree: 'equally' }).head)).toBe('gleich groß');
  });
});

describe('deStandard: a superlative\'s set (P09-E19)', () => {
  const selecting = (standard: ReturnType<typeof el>) => np(GROSS, { degree: 'most', domain: '1' }, { standard });

  test('the bare genitive of a noun, per conjunct', () => {
    expect(deStandard(selecting(el(np(MANN, { ...the, number: 'plural' }))))).toBe('der Männer');
    expect(deStandard(selecting(el(np(MANN, the))))).toBe('des Mannes');
  });

  test('"von" + the dative of a pronoun', () => {
    expect(deStandard(selecting(el(np(ICH, { number: 'plural', disjunctive: 'uns' }))))).toBe('von uns');
    expect(deStandard(selecting(el(np(ER))))).toBe('von ihm');
  });

  // A286: "von" governs the dative, so a mixed set takes it once, before the group.
  test('a coordinated set with a pronoun takes "von" once, every conjunct dative', () => {
    const us = np(ICH, { number: 'plural', disjunctive: 'uns' });
    const men = np(MANN, { ...the, number: 'plural' });
    expect(deStandard(selecting(group('and', us, men)))).toBe('von uns und den Männern');
    expect(deStandard(selecting(group('and', men, us)))).toBe('von den Männern und uns');
    // A set of nouns alone keeps its genitives.
    expect(deStandard(selecting(group('and', men, np(MANN, the))))).toBe('der Männer und des Mannes');
  });
});

