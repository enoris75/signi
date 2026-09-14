import { describe, expect, it } from 'vitest';
import type { NounElement, PhrasePlan } from '@signi/shared';
import { getTopElement } from '../../../src/components/PhraseBuilder/workspacePlan/functions/getTopElement.ts';

const CAT: NounElement = { concept: 'CAT' };
const DOG: NounElement = { concept: 'DOG' };
const HOUSE: NounElement = { concept: 'HOUSE' };

describe('getTopElement', () => {
  const plan: Partial<PhrasePlan> = { subject: CAT, directObject: DOG, complements: { locative: { phrase: HOUSE } } };

  it('finds the subject and direct object at the top of the plan', () => {
    expect(getTopElement(plan, 'subject')).toBe(CAT);
    expect(getTopElement(plan, 'directObject')).toBe(DOG);
  });

  it('finds a complement’s noun under its complement', () => {
    expect(getTopElement(plan, 'locative')).toBe(HOUSE);
  });

  it('is undefined for an empty slot', () => {
    expect(getTopElement({ subject: CAT }, 'directObject')).toBeUndefined();
    expect(getTopElement({ subject: CAT }, 'locative')).toBeUndefined();
    expect(getTopElement(plan, 'cause')).toBeUndefined();
  });
});
