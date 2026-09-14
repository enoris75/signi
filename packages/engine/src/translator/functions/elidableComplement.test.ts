import { describe, expect, test } from 'vitest';
import { clause, complement, complements, np, vp } from '../../languages/resolved.fixtures.js';
import type { ElidedComplement } from '../../types.js';
import { elidableComplement } from './elidableComplement.js';

const ESSERE = { base: 'essere', copula: '1' };
const MANGIARE = { base: 'mangiare' };
const CAT = np({ base: 'gatto' });
const HAPPY = complement(np({ base: 'felice', role: 'adjective' }));
const AT_HOME = complement(np({ base: 'casa' }));

describe('elidableComplement', () => {
  test('a copula hands on its predicative, before its locative', () => {
    const antecedent = clause(CAT, vp(ESSERE), { complements: complements({ locative: AT_HOME, predicative: HAPPY }) });
    expect(elidableComplement(antecedent)).toEqual({ type: 'predicative', complement: HAPPY });
  });

  test('failing a predicative, its locative', () => {
    const antecedent = clause(CAT, vp(ESSERE), { complements: complements({ locative: AT_HOME }) });
    expect(elidableComplement(antecedent)).toEqual({ type: 'locative', complement: AT_HOME });
  });

  test('failing both, the complement it elides itself, if any', () => {
    const elided: ElidedComplement = { type: 'predicative', complement: HAPPY };
    expect(elidableComplement(clause(CAT, vp(ESSERE, { elided })))).toBe(elided);
    expect(elidableComplement(clause(CAT, vp(ESSERE)))).toBeUndefined();
  });

  test('only a copula has one to hand on', () => {
    expect(elidableComplement(clause(CAT, vp(MANGIARE), { complements: complements({ predicative: HAPPY }) }))).toBeUndefined();
    expect(elidableComplement(clause(CAT))).toBeUndefined();
  });
});
