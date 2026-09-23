import { describe, expect, test } from 'vitest';
import { CANE, GRANDE, IO, UOMO, el, np } from './it.fixtures.js';
import { itDeg } from './itDeg.js';
import { itStandard } from './itStandard.js';

const the = { definiteness: 'definite' };
const compared = (degree: string, standard = el(np(CANE, the))) =>
  np(GRANDE, { degree, standard: '1' }, { standard });

describe('itStandard', () => {
  test('the comparatives take "di", fused with the article', () => {
    expect(itStandard(compared('more'))).toBe('del cane');
    expect(itStandard(compared('less', el(np(UOMO, the))))).toBe("dell'uomo");
    expect(itStandard(compared('more', el(np(CANE, { ...the, number: 'plural' }))))).toBe('dei cani');
  });

  test('"di" is repeated per conjunct, "quanto" said once before the group', () => {
    expect(itStandard(compared('more', el(np(CANE, the), np(UOMO, the))))).toBe("del cane e dell'uomo");
    expect(itStandard(compared('equally', el(np(CANE, the), np(UOMO, the))))).toBe("quanto il cane e l'uomo");
  });

  test('a pronoun standard takes its tonic form', () => {
    expect(itStandard(compared('more', el(np(IO))))).toBe('di me');
    expect(itStandard(compared('equally', el(np(IO))))).toBe('quanto me');
  });

  test('nothing without a standard', () => {
    expect(itStandard(np(GRANDE, { degree: 'more' }))).toBe('');
  });

  test('the equative adverb is "tanto" before a standard and "ugualmente" without one', () => {
    expect(itDeg(compared('equally').head, 'grande')).toBe('tanto grande');
    expect(itDeg(np(GRANDE, { degree: 'equally' }).head, 'grande')).toBe('ugualmente grande');
  });
});
