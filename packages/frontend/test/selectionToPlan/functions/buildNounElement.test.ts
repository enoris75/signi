import { describe, expect, it } from 'vitest';
import { buildNounElement } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/buildNounElement.ts';
import { buildNounPhrase } from '../../../src/components/PhraseBuilder/selectionToPlan/functions/buildNounPhrase.ts';
import type { PhraseSelection } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { BIG, BOY, CAT, DOG } from '../fixtures.ts';

describe('buildNounElement', () => {
  it('is undefined for an empty slot, even with conjuncts waiting', () => {
    expect(buildNounElement({ subjectConjuncts: [{ subject: CAT }] }, 'subject')).toBeUndefined();
  });

  it.each<[string, PhraseSelection]>([
    ['no conjuncts', { subject: BOY }],
    ['an empty conjunct list', { subject: BOY, subjectConjuncts: [] }],
    ['only conjuncts with no head yet', { subject: BOY, subjectConjuncts: [{}, {}] }],
  ])('is the plain noun phrase with %s', (_, sel) => {
    expect(buildNounElement(sel, 'subject')).toEqual(buildNounPhrase(sel, 'subject'));
  });

  it('groups the head with its conjuncts under "and" by default', () => {
    const sel: PhraseSelection = { subject: BOY, subjectConjuncts: [{ subject: CAT }, { subject: DOG }] };

    expect(buildNounElement(sel, 'subject')).toMatchObject({
      conjuncts: [{ concept: 'BOY' }, { concept: 'CAT' }, { concept: 'DOG' }],
      conjunction: 'and',
    });
  });

  it('joins the group with the conjunction chosen for the block', () => {
    const sel: PhraseSelection = {
      directObject: CAT,
      directObjectConjuncts: [{ subject: DOG }],
      directObjectConjunction: 'or',
    };

    expect(buildNounElement(sel, 'directObject')).toMatchObject({ conjunction: 'or' });
  });

  it('skips a conjunct with no head among full ones', () => {
    const sel: PhraseSelection = { subject: BOY, subjectConjuncts: [{}, { subject: DOG }] };

    expect(buildNounElement(sel, 'subject')).toMatchObject({ conjuncts: [{ concept: 'BOY' }, { concept: 'DOG' }] });
  });

  it('gives each conjunct its own surface, and resolves its references against the period', () => {
    const sel: PhraseSelection = {
      subject: BOY,
      subjectNumber: 'plural',
      subjectConjuncts: [
        { subject: DOG, subjectAdjective: BIG, subjectDefiniteness: 'indefinite', subjectPossessorRef: 'subject' },
      ],
    };

    expect(buildNounElement(sel, 'subject')).toMatchObject({
      conjuncts: [
        { concept: 'BOY', number: 'plural' },
        {
          concept: 'DOG',
          adjectives: ['BIG'],
          definiteness: 'indefinite',
          possessor: { kind: 'pronominal', number: 'plural' },
        },
      ],
    });
  });
});
