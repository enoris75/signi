import { describe, expect, test } from 'vitest';
import { el, group, np } from '../languages/resolved.fixtures.js';
import { recipientPronoun, withoutTerminus } from './recipientPronoun.js';

const LEI = { person: '3', number: 'singular', gender: 'fem', base: 'lei', dative: 'gli', dative_fem: 'le' };
const CANE = { base: 'cane' };

describe('recipientPronoun', () => {
  // A351: a lone personal pronoun recipient becomes the dative clitic.
  test('a lone personal pronoun terminus', () => {
    expect(recipientPronoun({ terminus: { phrase: el(np(LEI)) } })).toEqual(LEI);
  });

  test('no terminus, a noun, a coordination, an indefinite or generic pronoun, a focus, a negation', () => {
    expect(recipientPronoun(undefined)).toBeUndefined();
    expect(recipientPronoun({})).toBeUndefined();
    expect(recipientPronoun({ terminus: { phrase: el(np(CANE)) } })).toBeUndefined();
    expect(recipientPronoun({ terminus: { phrase: group('and', np(LEI), np(CANE)) } })).toBeUndefined();
    expect(recipientPronoun({ terminus: { phrase: el(np({ base: 'qualcuno', person: '3', indefinite: '1' })) } })).toBeUndefined();
    expect(recipientPronoun({ terminus: { phrase: el(np({ base: 'uno', person: '3', generic: '1' })) } })).toBeUndefined();
    expect(recipientPronoun({ terminus: { phrase: el(np(LEI, {}, { focus: 'only' })) } })).toBeUndefined();
    expect(recipientPronoun({ terminus: { phrase: el(np(LEI)), negative: true } })).toBeUndefined();
    expect(recipientPronoun({ terminus: { phrase: el(np(LEI)) } }, { base: 'relier', terminus_tonic: '1' })).toBeUndefined();
  });
});

describe('withoutTerminus', () => {
  test('drops the terminus and keeps the rest', () => {
    const locative = { phrase: el(np(CANE)) };
    expect(withoutTerminus({ terminus: { phrase: el(np(LEI)) }, locative })).toEqual({ locative });
    expect(withoutTerminus(undefined)).toBeUndefined();
  });
});
