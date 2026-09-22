import { describe, expect, test } from 'vitest';
import { np } from '../../languages/resolved.fixtures.js';
import { groupAgreement } from './groupAgreement.js';

const PIETRO = { base: 'Pietro', number: 'singular', gender: 'masc' };
const VOLPE = { base: 'volpe', number: 'singular', gender: 'fem' };
const RAGAZZI = { base: 'ragazzi', number: 'plural', gender: 'masc' };
const IO = { base: 'io', person: '1', number: 'singular', gender: 'masc' };
const TU = { base: 'tu', person: '2', number: 'singular', gender: 'fem' };

describe('groupAgreement', () => {
  describe('and', () => {
    test('is plural, and takes the lowest person among the conjuncts', () => {
      expect(groupAgreement([np(PIETRO), np(TU)], 'and', 'it')).toEqual({ person: '2', number: 'plural', gender: 'masc' });
      expect(groupAgreement([np(TU), np(IO)], 'and', 'it')).toMatchObject({ person: '1' });
      expect(groupAgreement([np(PIETRO), np(VOLPE)], 'and', 'it')).toMatchObject({ person: '3' });
    });

    test('is feminine only if every conjunct is', () => {
      expect(groupAgreement([np(VOLPE), np(TU)], 'and', 'it')).toMatchObject({ gender: 'fem' });
      expect(groupAgreement([np(VOLPE), np(PIETRO)], 'and', 'it')).toMatchObject({ gender: 'masc' });
    });

    test('a conjunct whose person is none of the three agrees as the 3rd', () => {
      expect(groupAgreement([np({ person: '' }), np({ person: '' })], 'and', 'it')).toMatchObject({ person: '3' });
    });
  });

  describe('or', () => {
    test('agrees with the nearest conjunct, taking only its agreement features', () => {
      expect(groupAgreement([np(IO), np(RAGAZZI)], 'or', 'it')).toEqual({ number: 'plural', gender: 'masc' });
      expect(groupAgreement([np(RAGAZZI), np(TU)], 'or', 'it')).toEqual({ person: '2', number: 'singular', gender: 'fem' });
    });

    test('in French, a group of mixed persons resolves as under and', () => {
      expect(groupAgreement([np(TU), np(IO)], 'or', 'fr')).toEqual({ person: '1', number: 'plural', gender: 'masc' });
    });

    test('in French, a group of one person keeps the nearest conjunct', () => {
      expect(groupAgreement([np(PIETRO), np(VOLPE)], 'or', 'fr')).toEqual({ number: 'singular', gender: 'fem' });
    });
  });

  test('any no-determined conjunct marks the whole group negative, under either conjunction', () => {
    expect(groupAgreement([np(PIETRO), np(VOLPE, { definiteness: 'no' })], 'and', 'fr')).toMatchObject({ definiteness: 'no' });
    expect(groupAgreement([np(PIETRO, { definiteness: 'no' }), np(VOLPE)], 'or', 'fr')).toMatchObject({ definiteness: 'no' });
    expect(groupAgreement([np(PIETRO), np(VOLPE)], 'and', 'fr')).not.toHaveProperty('definiteness');
  });

  test('the group is an animal only when every conjunct is, under either conjunction', () => {
    const GATTO = { base: 'gatto', number: 'singular', gender: 'masc', animal: '1' };
    expect(groupAgreement([np(GATTO), np(VOLPE, { animal: '1' })], 'and', 'de')).toMatchObject({ animal: '1' });
    expect(groupAgreement([np(GATTO), np(VOLPE, { animal: '1' })], 'or', 'de')).toMatchObject({ animal: '1' });
    expect(groupAgreement([np(GATTO), np(PIETRO)], 'and', 'de')).not.toHaveProperty('animal');
    expect(groupAgreement([np(PIETRO), np(GATTO)], 'or', 'de')).not.toHaveProperty('animal');
  });
});
