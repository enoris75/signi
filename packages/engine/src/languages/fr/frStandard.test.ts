import { describe, expect, test } from 'vitest';
import { ANIMAL, CHIEN, GRAND, HOMME, JE, el, np } from './fr.fixtures.js';
import { frComparison } from './frComparison.js';
import { frStandard as render } from './frStandard.js';
import type { ResolvedNounPhrase } from '../../types.js';

/** The renderer reads the compared adjective and its standard; these tests build them as one phrase. */
const frStandard = (np: ResolvedNounPhrase) => render(np.head, np.standard);

const the = { definiteness: 'definite' };
const compared = (degree: string, standard = el(np(CHIEN, the))) =>
  np(GRAND, { degree, standard: '1' }, { standard });

describe('frStandard', () => {
  test('every degree that takes a standard takes "que"', () => {
    expect(frStandard(compared('more'))).toBe('que le chien');
    expect(frStandard(compared('less'))).toBe('que le chien');
    expect(frStandard(compared('equally'))).toBe('que le chien');
  });

  test('"que" elides before a vowel', () => {
    expect(frStandard(compared('more', el(np(CHIEN, { definiteness: 'indefinite' }))))).toBe("qu'un chien");
    expect(frStandard(compared('more', el(np(HOMME, the))))).toBe("que l'homme");
  });

  test('a pronoun standard takes its tonic form', () => {
    expect(frStandard(compared('more', el(np(JE))))).toBe('que moi');
  });

  test('a coordinated standard shares the one "que"', () => {
    expect(frStandard(compared('more', el(np(CHIEN, the), np(HOMME, the))))).toBe("que le chien et l'homme");
  });

  test('the equative keeps "aussi" either way', () => {
    expect(frComparison(compared('equally').head, 'masc', false)).toBe('aussi grand');
    expect(frComparison(np(GRAND, { degree: 'equally' }).head, 'masc', false)).toBe('aussi grand');
  });
});

describe('frStandard: a superlative\'s set (P09-E19)', () => {
  const selecting = (standard: ReturnType<typeof el>) => np(GRAND, { degree: 'most', domain: '1' }, { standard });
  const plural = { ...the, number: 'plural' };

  test('"de" fused with each conjunct\'s article', () => {
    expect(frStandard(selecting(el(np(ANIMAL, plural))))).toBe('des animaux');
    expect(frStandard(selecting(el(np(CHIEN, the))))).toBe('du chien');
    expect(frStandard(selecting(el(np(ANIMAL, plural), np(HOMME, plural))))).toBe('des animaux et des hommes');
  });

  test('"d\'entre" before a pronoun, never the bare "de"', () => {
    expect(frStandard(selecting(el(np(JE, { number: 'plural', disjunctive: 'nous' }))))).toBe("d'entre nous");
  });
});
