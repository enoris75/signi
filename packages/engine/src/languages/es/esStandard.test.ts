import { describe, expect, test } from 'vitest';
import { GRANDE, HOMBRE, NOSOTROS, PERRO, YO, el, np } from './es.fixtures.js';
import { esDeg } from './esDeg.js';
import { esStandard as render } from './esStandard.js';
import type { ResolvedNounPhrase } from '../../types.js';

/** The renderer reads the compared adjective and its standard; these tests build them as one phrase. */
const esStandard = (np: ResolvedNounPhrase) => render(np.head, np.standard);

const the = { definiteness: 'definite' };
const compared = (degree: string, standard = el(np(PERRO, the))) =>
  np(GRANDE, { degree, standard: '1' }, { standard });

describe('esStandard', () => {
  test('the comparatives take "que", the equative "como", contracting with nothing', () => {
    expect(esStandard(compared('more'))).toBe('que el perro');
    expect(esStandard(compared('less'))).toBe('que el perro');
    expect(esStandard(compared('equally'))).toBe('como el perro');
  });

  test('a pronoun standard takes its subject form, not the tonic one', () => {
    expect(esStandard(compared('more', el(np(YO))))).toBe('que yo');
  });

  test('a coordinated standard shares the one word', () => {
    expect(esStandard(compared('more', el(np(PERRO, the), np(HOMBRE, the))))).toBe('que el perro y el hombre');
  });

  test('the equative adverb is "tan" before a standard and "igual de" without one', () => {
    expect(esDeg(compared('equally').head, 'grande')).toBe('tan grande');
    expect(esDeg(np(GRANDE, { degree: 'equally' }).head, 'grande')).toBe('igual de grande');
  });

  // A255: VERY keeps "igual de" before a standard, and "igual de" takes "que".
  test('under an equative intensifier the standard takes "que"', () => {
    const under = np(GRANDE, { degree: 'equally', standard: '1', intensifier: 'igual de', intensifier_equative: '1' }, { standard: el(np(PERRO, the)) });
    expect(esStandard(under)).toBe('que el perro');
    expect(esDeg(under.head, 'grande')).toBe('igual de grande');
  });
});

describe('esStandard: a superlative\'s set (P09-E19)', () => {
  const selecting = (standard: ReturnType<typeof el>) => np(GRANDE, { degree: 'most', domain: '1' }, { standard });

  test('"de" contracting per conjunct, and the tonic pronoun', () => {
    expect(esStandard(selecting(el(np(PERRO, the))))).toBe('del perro');
    expect(esStandard(selecting(el(np(PERRO, { ...the, number: 'plural' }), np(HOMBRE, { ...the, number: 'plural' }))))).toBe('de los perros y de los hombres');
    expect(esStandard(selecting(el(np(NOSOTROS))))).toBe('de nosotros');
  });
});
