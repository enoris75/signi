import { describe, expect, test } from 'vitest';
import { CHIEN, GRAND, HOMME, JE, el, np } from './fr.fixtures.js';
import { frComparison } from './frComparison.js';
import { frStandard } from './frStandard.js';

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
