import { describe, expect, test } from 'vitest';
import { CAO, EU, GRANDE, HOMEM, el, np } from './pt.fixtures.js';
import { ptComparison } from './ptComparison.js';
import { ptStandard } from './ptStandard.js';

const the = { definiteness: 'definite' };
const compared = (degree: string, standard = el(np(CAO, the))) =>
  np(GRANDE, { degree, standard: '1' }, { standard });

describe('ptStandard', () => {
  test('the comparatives take the fixed "do que", the equative "como"', () => {
    expect(ptStandard(compared('more'))).toBe('do que o cão');
    expect(ptStandard(compared('less'))).toBe('do que o cão');
    expect(ptStandard(compared('equally'))).toBe('como o cão');
  });

  test('a pronoun standard takes its subject form', () => {
    expect(ptStandard(compared('more', el(np(EU))))).toBe('do que eu');
  });

  test('a coordinated standard shares the one word', () => {
    expect(ptStandard(compared('more', el(np(CAO, the), np(HOMEM, the))))).toBe('do que o cão e o homem');
  });

  test('the synthetic comparative stays; the equative adverb is "tão" before a standard only', () => {
    expect(ptComparison(compared('more').head, 'masc', false)).toBe('maior');
    expect(ptComparison(compared('equally').head, 'masc', false)).toBe('tão grande');
    expect(ptComparison(np(GRANDE, { degree: 'equally' }).head, 'masc', false)).toBe('igualmente grande');
  });
});
