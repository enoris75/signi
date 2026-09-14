import { describe, expect, it } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { getNoun } from '../../../src/components/PhraseBuilder/workspacePlan/functions/getNoun.ts';

const OWNER: NounPhrase = { concept: 'BOY' };
const CAT: NounPhrase = { concept: 'CAT', possessor: OWNER };
const DOG: NounPhrase = { concept: 'DOG', possessor: { kind: 'pronominal', person: '3', number: 'singular' } };
const BIRD: NounPhrase = { concept: 'BIRD' };
const HOUSE: NounPhrase = { concept: 'HOUSE' };

const PLAN: Partial<PhrasePlan> = {
  subject: { conjuncts: [CAT, DOG, BIRD], conjunction: 'and' },
  directObject: DOG,
  complements: { locative: { phrase: HOUSE } },
};

describe('getNoun', () => {
  it('finds a slot’s own noun phrase, the very object in the plan', () => {
    expect(getNoun(PLAN, 'directObject')).toBe(DOG);
    expect(getNoun(PLAN, 'locative')).toBe(HOUSE);
  });

  it('finds the head of a coordinated slot', () => {
    expect(getNoun(PLAN, 'subject')).toBe(CAT);
  });

  it('descends into a genitive possessor', () => {
    expect(getNoun(PLAN, 'subject/possessor')).toBe(OWNER);
  });

  it('counts conjuncts past the head', () => {
    expect(getNoun(PLAN, 'subject/conjunct/0')).toBe(DOG);
    expect(getNoun(PLAN, 'subject/conjunct/1')).toBe(BIRD);
  });

  it.each([
    ['an empty slot', 'cause'],
    ['a pronominal possessor, which is no noun phrase', 'directObject/possessor'],
    ['a missing possessor', 'locative/possessor'],
    ['a step below a missing possessor', 'locative/possessor/possessor'],
    ['a conjunct past the end', 'subject/conjunct/2'],
    ['a conjunct of an uncoordinated slot', 'directObject/conjunct/0'],
    ['a conjunct index that is not a number', 'subject/conjunct/first'],
    ['a conjunct step with no index', 'subject/conjunct'],
    ['an unknown step', 'subject/relative'],
  ])('is undefined for %s', (_, address) => {
    expect(getNoun(PLAN, address)).toBeUndefined();
  });

  it('chains steps: a conjunct’s possessor', () => {
    const plan: Partial<PhrasePlan> = { subject: { conjuncts: [HOUSE, CAT], conjunction: 'or' } };

    expect(getNoun(plan, 'subject/conjunct/0/possessor')).toBe(OWNER);
  });
});
