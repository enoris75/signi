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

  // P09-E12 D5: the predicate adjective's standard of comparison is a nested phrase like an owner,
  // so it saves as one and comes back as one — without it, the key would hydrate to a bare id.
  it('restores the standard of comparison of a predicate adjective', () => {
    const selection = { predicative: BIG, adjectiveDegrees: { predicative: 'more' as const }, predicativeStandard: { subject: DOG, subjectDefiniteness: 'indefinite' as const } };
    const saved = serializeSelection(selection);
    expect(saved).toEqual({ predicative: 'BIG', adjectiveDegrees: { predicative: 'more' }, predicativeStandard: { subject: 'DOG', subjectDefiniteness: 'indefinite' } });
    expect(hydrate(saved).selection).toEqual(selection);
  });

  it('leaves out null fields', () => {
    expect(hydrate({ subject: 'CAT', verb: null, subjectPossessor: null }).selection).toEqual({ subject: CAT });
  });

  it.each<[string, SerializedSelection]>([
    ['a concept that is no id', { directObject: { id: 'BOY' }, verb: 42 }],
    ['a possessor that is no selection', { subjectPossessor: 'BOY', directObjectPossessor: [{ subject: 'CAT' }] }],
    ['conjuncts that are no list', { subjectConjuncts: 'DOG', directObjectConjuncts: { subject: 'CAT' } }],
    ['modifier adjectives that are no map', { modifierAdjectives: ['BIG'] }],
    ['slot-keyed maps that are no map', { modifierRelations: 'feature', adjectiveDegrees: ['more'] }],
  ])('drops %s, reporting no word missing', (_, damage) => {
    expect(hydrate({ subject: 'CAT', ...damage })).toEqual({ selection: { subject: CAT }, missing: [] });
  });

  it('drops the conjuncts that are no selection and keeps the rest', () => {
    expect(hydrate({ subject: 'BOY', subjectConjuncts: [null, 'CAT', { subject: 'DOG' }, []] }).selection).toEqual({
      subject: BOY,
      subjectConjuncts: [{ subject: DOG }],
    });
  });

  it('drops a modifier adjective that is no id and keeps the rest', () => {
    expect(
      hydrate({ modifierAdjectives: { subjectAdjective: 7, subjectAdjective2: 'SEMANTIC' } }),
    ).toEqual({ selection: { modifierAdjectives: { subjectAdjective2: SEMANTIC } }, missing: [] });
  });

  it('keeps a scalar field whatever was saved in it', () => {
    const saved = { subjectNumber: 3, verbTense: ['past'], subjectPossessorRef: { to: 'subject' } };

    expect(hydrate(saved).selection).toEqual(saved);
  });
});
