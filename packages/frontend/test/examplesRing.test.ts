// P09-E48: a noun's examples on the period's canvas — "animals such as the cat".
import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import type { PhraseSelection } from '../src/components/PhraseBuilder/interfaces.ts';
import { ownerPortKey, type RingAt } from '../src/components/PhraseBuilder/ownerChain.ts';
import { perimeterControlKey } from '../src/components/PhraseBuilder/ringSpecs.ts';
import { exampleRelationOf, examplesLink, examplesSpotsFor, takesExamples } from '../src/components/PhraseBuilder/examplesRing.ts';

const ANIMAL: Concept = { id: 'ANIMAL', role: 'noun', description: 'ANIMAL', label: 'animal' };
const CAT: Concept = { id: 'CAT', role: 'noun', description: 'CAT', label: 'cat' };
const SHE: Concept = { id: 'SHE', role: 'pronoun', description: 'SHE', label: 'she', person: '3' } as Concept;
const GROUPS = [{ mainKey: 'subject' }, { mainKey: 'verb' }, { mainKey: 'directObject' }];
const NAMED: PhraseSelection = { subject: ANIMAL, subjectExamples: { subject: CAT } };

describe('takesExamples', () => {
  it('is a noun head’s, never a pronoun’s', () => {
    expect(takesExamples(NAMED, 'subject')).toBe(true);
    expect(takesExamples({ subject: SHE }, 'subject')).toBe(false);
    expect(takesExamples({}, 'subject')).toBe(false);
  });
});

describe('examplesSpotsFor', () => {
  it('draws named examples beside their noun, after its conjuncts', () => {
    expect(examplesSpotsFor({ selection: NAMED, groups: GROUPS, open: {} })).toEqual([{
      address: 'subject/examples',
      possessed: 'subject',
      possessedKey: 'subject',
      role: 'subject',
      order: -0.25,
      named: true,
      relation: 'example',
    }]);
    const including = { ...NAMED, exampleRelations: { subject: 'inclusion' as const } };
    expect(examplesSpotsFor({ selection: including, groups: GROUPS, open: {} })[0]!.relation).toBe('inclusion');
    expect(exampleRelationOf(including, 'subject')).toBe('inclusion');
  });

  it('draws empty examples only while open, and folded ones not at all', () => {
    expect(examplesSpotsFor({ selection: { directObject: ANIMAL }, groups: GROUPS, open: {} })).toEqual([]);
    expect(examplesSpotsFor({ selection: { directObject: ANIMAL }, groups: GROUPS, open: { 'directObject/examples': true } })).toMatchObject([
      { address: 'directObject/examples', named: false },
    ]);
    expect(examplesSpotsFor({ selection: NAMED, groups: GROUPS, open: { 'subject/examples': false } })).toEqual([]);
    expect(examplesSpotsFor({ selection: NAMED, groups: [{ mainKey: 'verb' }], open: {} })).toEqual([]);
  });
});

describe('examplesLink', () => {
  const [spot] = examplesSpotsFor({ selection: NAMED, groups: GROUPS, open: {} });
  const rings: Record<string, RingAt> = {
    subject: { center: { x: 100, y: 100 }, rIn: 20, rOut: 60 },
    'subject/examples': { center: { x: 300, y: 100 }, rIn: 20, rOut: 60 },
  };

  it('runs from the examples control to the port the examples’ ring faces it with', () => {
    const at: Record<string, { x: number; y: number }> = {
      [`subject|${perimeterControlKey('examples', 'subject')}`]: { x: 150, y: 110 },
      [`subject/examples|${ownerPortKey(spot!)}`]: { x: 250, y: 100 },
    };
    const link = examplesLink({ spot: spot!, ringOf: (k) => rings[k], controlOn: (k, c) => at[`${k}|${c}`], compact: false });
    expect(link).toMatchObject({ from: { x: 150, y: 110 }, to: { x: 250, y: 100 }, mid: { x: 200, y: 105 } });
  });
});
