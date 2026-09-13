import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseSelection } from '../src/components/PhraseBuilder/interfaces.ts';
import {
  nounSliceAt,
  removePossessor,
  updateNounAt,
} from '../src/components/PhraseBuilder/phraseReducers.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });

const BOOK = noun('BOOK');
const CAT = noun('CAT');
const DOG = noun('DOG');
const BOY = noun('BOY');

// "the book of the cat of the dog, and the boy's …": an owner's owner, and a conjunct's owner.
const PERIOD: PhraseSelection = {
  subject: BOOK,
  subjectPossessor: { subject: CAT, subjectPossessor: { subject: DOG } },
  subjectConjuncts: [{ subject: BOY, subjectPossessorRef: 'subject' }],
};

describe('nounSliceAt', () => {
  it('finds the slice holding a noun at any depth, and its key there', () => {
    expect(nounSliceAt(PERIOD, 'subject')).toEqual({ slice: PERIOD, which: 'subject' });
    expect(nounSliceAt(PERIOD, 'subject/possessor/possessor')).toEqual({
      slice: { subject: DOG },
      which: 'subject',
    });
    expect(nounSliceAt(PERIOD, 'subject/conjunct/0')?.slice.subject).toBe(BOY);
  });

  it('finds nothing where a step is missing', () => {
    expect(nounSliceAt(PERIOD, 'directObject/possessor')).toBeUndefined();
    expect(nounSliceAt(PERIOD, 'subject/conjunct/3')).toBeUndefined();
    expect(nounSliceAt(PERIOD, 'subject/relative')).toBeUndefined();
  });
});

describe('updateNounAt', () => {
  it('edits the slice holding a deep noun, leaving the rest of the period as it was', () => {
    const next = updateNounAt(PERIOD, 'subject/possessor/possessor', (slice, which) =>
      removePossessor({ ...slice, [`${which}Number`]: 'plural' }, which),
    );

    expect(next).toEqual({
      ...PERIOD,
      subjectPossessor: { subject: CAT, subjectPossessor: { subject: DOG, subjectNumber: 'plural' } },
    });
    expect(next.subjectConjuncts).toBe(PERIOD.subjectConjuncts);
  });

  it('edits a conjunct’s slice, and seeds an owner’s the first time it is written', () => {
    const next = updateNounAt(PERIOD, 'subject/conjunct/0/possessor', (slice) => ({ ...slice, subject: DOG }));

    expect(next.subjectConjuncts).toEqual([
      { subject: BOY, subjectPossessor: { subject: DOG } },
    ]);
  });

  it('edits the period itself for a period noun', () => {
    expect(updateNounAt(PERIOD, 'subject', (slice, which) => removePossessor(slice, which))).toEqual({
      subject: BOOK,
      subjectConjuncts: PERIOD.subjectConjuncts,
    });
  });
});
