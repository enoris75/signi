import { describe, expect, it } from 'vitest';
import { pointerBend } from '../../src/components/PhraseBuilder/ownerChain.ts';
import type { Pt } from '../../src/components/PhraseBuilder/ringLayout.ts';
import { possessorAims } from '../../src/components/PhraseBuilder/functions/possessorAims.ts';

const CENTRES: Record<string, Pt> = {
  subject: { x: 100, y: 100 },
  directObject: { x: 400, y: 100 },
  'subject/possessor': { x: 150, y: 250 },
  'subject+1': { x: 100, y: 300 },
};
const centerOf = (key: string) => CENTRES[key];

describe('possessorAims', () => {
  it('aims a noun’s control at its owner’s ring', () => {
    const aims = possessorAims({
      owners: [{ address: 'subject/possessor', possessedKey: 'subject' }],
      pointers: [],
      groups: [{ mainKey: 'subject' }, { mainKey: 'directObject' }],
      hostedRings: {},
      centerOf,
    });

    expect(aims.toward('subject')).toEqual({ x: 150, y: 250 });
    expect(aims.byGroup).toEqual({ subject: { x: 150, y: 250 } });
  });

  it('aims a pointing noun’s control at the bend of its line, while the noun it points to is drawn', () => {
    const pointers = [{ possessedKey: 'directObject', antecedentKey: 'subject' }];
    const aims = possessorAims({
      owners: [],
      pointers,
      groups: [{ mainKey: 'subject' }, { mainKey: 'directObject' }],
      hostedRings: {},
      centerOf,
    });

    expect(aims.byGroup).toEqual({ directObject: pointerBend(CENTRES.directObject, CENTRES.subject) });
  });

  it('aims at a hosted ring pointed to, but not at a noun with no ring here', () => {
    const toward = (antecedentKey: string | undefined, hostedRings = {}) =>
      possessorAims({
        owners: [],
        pointers: [{ possessedKey: 'directObject', antecedentKey }],
        groups: [{ mainKey: 'directObject' }],
        hostedRings,
        centerOf,
      }).toward('directObject');

    expect(toward('subject+1', { 'subject+1': {} })).toEqual(pointerBend(CENTRES.directObject, CENTRES['subject+1']));
    expect(toward('subject+1')).toBeUndefined();
    expect(toward(undefined)).toBeUndefined();
  });
});
