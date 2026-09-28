import { describe, expect, test } from 'vitest';
import { isTableAdj, tableAdj } from './tableAdj.js';

const TAS_PATS = {
  base: 'tas pats', fem: 'ta pati', plural: 'tie patys', plural_fem: 'tos pačios', neuter: 'tas pats',
  gen: 'to paties', dat: 'tam pačiam', acc: 'tą patį', ins: 'tuo pačiu', loc: 'tame pačiame',
  fem_gen: 'tos pačios', fem_acc: 'tą pačią', plural_acc: 'tuos pačius', plural_fem_dat: 'toms pačioms',
};

describe('tableAdj', () => {
  test('reads the stored cell for the case, gender and number', () => {
    expect(tableAdj(TAS_PATS, 'nom', { gender: 'masc', plural: false })).toBe('tas pats');
    expect(tableAdj(TAS_PATS, 'acc', { gender: 'masc', plural: false })).toBe('tą patį');
    expect(tableAdj(TAS_PATS, 'acc', { gender: 'fem', plural: false })).toBe('tą pačią');
    expect(tableAdj(TAS_PATS, 'acc', { gender: 'masc', plural: true })).toBe('tuos pačius');
    expect(tableAdj(TAS_PATS, 'dat', { gender: 'fem', plural: true })).toBe('toms pačioms');
    expect(tableAdj(TAS_PATS, 'nom', { gender: 'fem', plural: true })).toBe('tos pačios');
  });

  test('a missing cell falls back on its nominative; an invariable one never changes', () => {
    expect(tableAdj(TAS_PATS, 'ins', { gender: 'fem', plural: false })).toBe('ta pati');
    expect(tableAdj({ base: 'gerai', invariable: '1' }, 'gen', { gender: 'fem', plural: true })).toBe('gerai');
  });

  test('which adjectives store a table', () => {
    expect(isTableAdj(TAS_PATS)).toBe(true);
    expect(isTableAdj({ base: 'be pavadinimo', invariable: '1' })).toBe(true);
    expect(isTableAdj({ base: 'geras', fem: 'gera' })).toBe(false);
  });
});
