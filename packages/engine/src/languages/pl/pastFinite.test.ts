import { describe, expect, test } from 'vitest';
import { pastFinite } from './pastFinite.js';
import { ISC, JESC, MOC } from './pl.fixtures.js';
import type { VerbAgr } from './pl.types.js';

const agr = (person: VerbAgr['person'], plural = false, gender: VerbAgr['gender'] = 'masc', virile = plural && gender === 'masc'): VerbAgr =>
  ({ person, plural, gender, virile });

describe('pastFinite', () => {
  test('the person endings on the participle', () => {
    expect(pastFinite(JESC, true, agr('1'))).toBe('zjadłem');
    expect(pastFinite(JESC, true, agr('2', false, 'fem'))).toBe('zjadłaś');
    expect(pastFinite(JESC, true, agr('3', false, 'fem'))).toBe('zjadła');
    expect(pastFinite(JESC, true, agr('1', true))).toBe('zjedliśmy');
    expect(pastFinite(JESC, true, agr('2', true, 'fem'))).toBe('zjadłyście');
    expect(pastFinite(JESC, false, agr('3', true))).toBe('jedli');
  });

  test('the 1sg/2sg masculine stem where it differs', () => {
    expect(pastFinite(MOC, false, agr('1'))).toBe('mogłem');
    expect(pastFinite(MOC, false, agr('3'))).toBe('mógł');
    expect(pastFinite(ISC, true, agr('2'))).toBe('poszedłeś');
  });
});
