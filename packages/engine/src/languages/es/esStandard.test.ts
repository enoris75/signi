import { describe, expect, test } from 'vitest';
import { GRANDE, HOMBRE, PERRO, YO, el, np } from './es.fixtures.js';
import { esDeg } from './esDeg.js';
import { esStandard } from './esStandard.js';

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
});
