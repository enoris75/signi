import { describe, expect, test } from 'vitest';
import { CUIDADO, type Forms, GATO, MANERA, TIEMPO, VELOCIDAD } from './es.fixtures.js';
import { esMannerHead } from './esMannerHead.js';

const MODO: Forms = { base: 'modo', plural: 'modos', gender: 'masc', count: 'singular', mannerRelation: 'mode' };

describe('esMannerHead', () => {
  test('means is con, which fuses with nothing', () => {
    expect(esMannerHead({ ...CUIDADO, definiteness: 'bare' }, false)).toBe('con');
    expect(esMannerHead({ ...CUIDADO, definiteness: 'many' }, false)).toBe('con mucho');
    expect(esMannerHead(CUIDADO, false)).toBe('con el');
  });

  test('measure is a, fused to al before a masculine singular definite', () => {
    expect(esMannerHead(VELOCIDAD, false)).toBe('a la');
    expect(esMannerHead(TIEMPO, false)).toBe('al');
    expect(esMannerHead(TIEMPO, true)).toBe('a los');
    expect(esMannerHead({ ...VELOCIDAD, definiteness: 'indefinite' }, false)).toBe('a una');
    expect(esMannerHead({ ...VELOCIDAD, definiteness: 'bare' }, false)).toBe('a');
  });

  test('mode is de, fused to del before a masculine singular definite', () => {
    expect(esMannerHead(MANERA, false)).toBe('de la');
    expect(esMannerHead(MODO, false)).toBe('del');
    expect(esMannerHead({ ...MANERA, definiteness: 'indefinite' }, false)).toBe('de una');
    expect(esMannerHead({ ...MANERA, definiteness: 'this' }, false)).toBe('de esta');
  });

  test('a noun with no manner relation is similative como', () => {
    expect(esMannerHead(GATO, false)).toBe('como el');
    expect(esMannerHead({ ...GATO, definiteness: 'indefinite' }, false)).toBe('como un');
    expect(esMannerHead(GATO, true)).toBe('como los');
  });
});
