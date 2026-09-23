import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import type { ResolvedNounElement, ResolvedNounPhrase } from '../../types.js';
import { jaRespectRegister } from './jaRespectRegister.js';

const head = (forms: Record<string, string>, possessor?: ResolvedNounPhrase | PronominalPossessor): ResolvedNounPhrase =>
  ({ head: { conceptId: 'X', forms }, adjectives: [], nounModifiers: [], ...(possessor ? { possessor } : {}) });
const of = (person: '1' | '2' | '3', gender?: 'masc' | 'fem' | 'neut'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number: 'singular', ...(gender ? { gender } : {}) });
const subject = (...conjuncts: ResolvedNounPhrase[]): ResolvedNounElement => ({ conjuncts, agreement: {} });

const yourMother = head({ kin: '1' }, of('2'));
const myFather = head({ kin: '1', own: '1' }, of('1'));

describe('jaRespectRegister', () => {
  test('someone else\'s relative is raised: a 2nd- or 3rd-person owner, or a person in particular', () => {
    expect(jaRespectRegister(subject(yourMother))).toBe('honorific');
    expect(jaRespectRegister(subject(head({ kin: '1' }, of('3', 'fem'))))).toBe('honorific');
    expect(jaRespectRegister(subject(head({ kin: '1' }, head({ human: '1' }))))).toBe('honorific');
  });

  test('no one to be polite to keeps the plain verb: no owner, a thing, an animal, nobody in particular', () => {
    expect(jaRespectRegister(subject(head({ kin: '1' })))).toBeUndefined();
    expect(jaRespectRegister(subject(head({ kin: '1' }, of('3', 'neut'))))).toBeUndefined();
    expect(jaRespectRegister(subject(head({ kin: '1' }, head({ animate: '1' }))))).toBeUndefined();
    expect(jaRespectRegister(subject(head({ kin: '1' }, head({ human: '1', definiteness: 'indefinite' }))))).toBeUndefined();
  });

  test('a subject that is not kin is never raised (D3)', () => {
    expect(jaRespectRegister(subject(head({ human: '1' }, of('2'))))).toBeUndefined();
  });

  test('the humble is opt-in, and only for the speaker\'s own side (D4)', () => {
    expect(jaRespectRegister(subject(myFather))).toBeUndefined();
    expect(jaRespectRegister(subject(myFather), true)).toBe('humble');
    expect(jaRespectRegister(subject(head({ person: '1' })), true)).toBe('humble');
    expect(jaRespectRegister(subject(head({ animate: '1' })), true)).toBeUndefined();
    // Someone else's relative is raised whatever the plan asks.
    expect(jaRespectRegister(subject(yourMother), true)).toBe('honorific');
  });

  test('a coordinated subject takes a register only when every conjunct does', () => {
    expect(jaRespectRegister(subject(yourMother, head({ kin: '1' }, of('2'))))).toBe('honorific');
    expect(jaRespectRegister(subject(yourMother, head({ animate: '1' })))).toBeUndefined();
    expect(jaRespectRegister(subject(myFather, head({ person: '1' })), true)).toBe('humble');
  });
});
