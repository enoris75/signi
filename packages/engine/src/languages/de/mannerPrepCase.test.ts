import { describe, expect, test } from 'vitest';
import { GESCHWINDIGKEIT, SORGFALT, WEISE, WIND, ZEIT } from './de.fixtures.js';
import { mannerPrepCase } from './mannerPrepCase.js';

describe('mannerPrepCase', () => {
  test('the manner relation picks the preposition and its case', () => {
    expect(mannerPrepCase(WEISE)).toEqual(['auf', 'acc']);
    expect(mannerPrepCase(SORGFALT)).toEqual(['mit', 'dat']);
    expect(mannerPrepCase(GESCHWINDIGKEIT)).toEqual(['mit', 'dat']);
    expect(mannerPrepCase(WIND)).toEqual(['wie', 'nom']);
  });

  test('a temporal noun takes "zu" + dative whatever its relation', () => {
    expect(mannerPrepCase(ZEIT)).toEqual(['zu', 'dat']);
  });
});
