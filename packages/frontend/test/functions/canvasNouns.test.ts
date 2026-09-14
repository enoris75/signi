import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import { canvasChains, ownableNouns } from '../../src/components/PhraseBuilder/functions/canvasNouns.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const PETER = noun('PETER');
const PAUL = noun('PAUL');
const MARY = noun('MARY');
const CAT = noun('CAT');

const groups = (...keys: string[]) => keys.map((mainKey) => ({ mainKey }));

describe('canvasChains', () => {
  it('counts the conjuncts of each coordinated noun whose ring is on the canvas', () => {
    expect(
      canvasChains(
        { subject: PETER, subjectConjuncts: [{ subject: PAUL }, { subject: MARY }], directObject: CAT },
        groups('subject', 'verb', 'directObject'),
      ),
    ).toEqual([{ which: 'subject', count: 2 }]);
  });

  it('leaves out a coordinated noun whose ring is not drawn', () => {
    expect(canvasChains({ subject: PETER, subjectConjuncts: [{ subject: PAUL }] }, groups('verb'))).toEqual([]);
  });
});

describe('ownableNouns', () => {
  it('offers an owner to the nouns on the canvas whose possessor control is available', () => {
    const satellites = [
      { key: 'subjectPossessor', available: true },
      { key: 'directObjectPossessor', available: false },
      { key: 'causePossessor', available: true },
    ];

    expect(ownableNouns(groups('subject', 'verb', 'directObject'), satellites)).toEqual(['subject']);
  });
});
