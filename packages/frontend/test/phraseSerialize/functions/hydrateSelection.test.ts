import { describe, expect, it } from 'vitest';
import type { Concept, SerializedSelection } from '@signi/shared';
import { hydrateSelection } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/hydrateSelection.ts';
import { serializeSelection } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/serializeSelection.ts';
import { BIG, BOY, CAT, CATALOG, DOG, PHRASE, RICH, RICH_SAVED, SEMANTIC } from '../fixtures.ts';

const hydrate = (saved: SerializedSelection, catalog: Concept[] = CATALOG) => {
  const missing = new Set<string>();
  const selection = hydrateSelection(saved, new Map(catalog.map((c) => [c.id, c])), missing);
  return { selection, missing: [...missing].sort() };
};

describe('hydrateSelection', () => {
  it('restores every concept from the catalog, however deep, and keeps everything else', () => {
    expect(hydrate(RICH_SAVED)).toEqual({ selection: RICH, missing: [] });
  });

  it('round-trips a saved selection', () => {
    expect(hydrate(serializeSelection(RICH)).selection).toEqual(RICH);
  });

  it('drops the concepts the catalog no longer holds and reports them once each', () => {
    const { selection, missing } = hydrate(RICH_SAVED, [BOY, CAT]);

    expect(missing).toEqual(['BIG', 'DOG', 'EAT', 'HOUSE', 'NEVER', 'PHRASE', 'QUICKLY', 'SEMANTIC', 'WANT']);
    expect(selection).toMatchObject({
      subject: BOY,
      directObject: CAT,
      subjectConjuncts: [{ subjectDefiniteness: 'indefinite' }],
      directObjectPossessor: { subject: BOY, subjectPossessor: {} },
      modifierAdjectives: {},
    });
    expect(selection).not.toHaveProperty('verb');
    expect(selection).not.toHaveProperty('subjectAdjective');
  });

  it('renames the legacy indirect object everywhere a slot key appears', () => {
    const { selection } = hydrate({
      indirectObject: 'CAT',
      indirectObjectNumber: 'plural',
      indirectObjectAdjective: 'PHRASE',
      indirectObjectPossessor: { subject: 'BOY', subjectAdjective: 'BIG' },
      modifierRelations: { indirectObjectAdjective: 'material' },
      modifierNumbers: { indirectObjectAdjective: 'plural' },
      modifierAdjectives: { indirectObjectAdjective: 'SEMANTIC' },
      adjectiveDegrees: { indirectObjectAdjective2: 'most' },
    });

    expect(selection).toEqual({
      terminus: CAT,
      terminusNumber: 'plural',
      terminusAdjective: PHRASE,
      terminusPossessor: { subject: BOY, subjectAdjective: BIG },
      modifierRelations: { terminusAdjective: 'material' },
      modifierNumbers: { terminusAdjective: 'plural' },
      modifierAdjectives: { terminusAdjective: SEMANTIC },
      adjectiveDegrees: { terminusAdjective2: 'most' },
    });
  });

  it('restores the conjuncts of each group', () => {
    expect(hydrate({ subject: 'BOY', subjectConjuncts: [{ subject: 'CAT' }, { subject: 'DOG' }] }).selection).toEqual({
      subject: BOY,
      subjectConjuncts: [{ subject: CAT }, { subject: DOG }],
    });
  });

  it('leaves out null fields', () => {
    expect(hydrate({ subject: 'CAT', verb: null, subjectPossessor: null }).selection).toEqual({ subject: CAT });
  });

  it('keeps a value whose shape does not fit its key as it is', () => {
    const saved = {
      subject: 42,
      subjectPossessor: 'BOY',
      subjectConjuncts: 'DOG',
      modifierAdjectives: 'BIG',
      modifierRelations: 'feature',
    };

    expect(hydrate(saved)).toEqual({ selection: saved, missing: [] });
  });
});
