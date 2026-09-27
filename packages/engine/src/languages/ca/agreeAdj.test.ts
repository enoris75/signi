import { describe, expect, test } from 'vitest';
import { BLANC, GRAN, MENJAR, NOU } from './ca.fixtures.js';
import { agreeAdj, agreeParticiple } from './agreeAdj.js';

describe('agreeAdj', () => {
  test('reads the four stored forms', () => {
    expect(agreeAdj(BLANC, 'masc', false)).toBe('blanc');
    expect(agreeAdj(BLANC, 'fem', false)).toBe('blanca');
    expect(agreeAdj(BLANC, 'masc', true)).toBe('blancs');
    expect(agreeAdj(BLANC, 'fem', true)).toBe('blanques');
    expect(agreeAdj(NOU, 'fem', true)).toBe('noves');
    expect(agreeAdj(GRAN, 'fem', false)).toBe('gran');
  });

  test('derives a form the lexeme lacks by rule', () => {
    expect(agreeAdj({ base: 'junt' }, 'fem', true)).toBe('juntes');
  });

  test('is empty for an empty adjective', () => {
    expect(agreeAdj({}, 'masc', false)).toBe('');
  });
});

describe('agreeParticiple', () => {
  test('reads the stored participle forms', () => {
    expect(agreeParticiple(MENJAR, 'menjat', 'fem', false)).toBe('menjada');
    expect(agreeParticiple(MENJAR, 'menjat', 'fem', true)).toBe('menjades');
    expect(agreeParticiple(MENJAR, 'menjat', 'masc', true)).toBe('menjats');
  });

  test('a participle other than the stored one agrees by rule', () => {
    expect(agreeParticiple(MENJAR, 'vist', 'masc', true)).toBe('vistos');
  });
});
