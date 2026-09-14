import { describe, expect, it } from 'vitest';
import { COMPLEMENT_TYPES } from '@signi/shared';
import {
  CONCEPT_BASE_KEYS,
  LEGACY_INDIRECT,
  SLOT_KEYED_MAPS,
} from '../../src/components/PhraseBuilder/phraseSerialize/phraseSerialize.consts.ts';

describe('CONCEPT_BASE_KEYS', () => {
  it('names the core slots, the modal chain with its adverbs, and every complement head', () => {
    expect([...CONCEPT_BASE_KEYS].sort()).toEqual(
      [
        'subject',
        'verb',
        'directObject',
        'modifier',
        'verbModal',
        'verbModal2',
        'verbModalAdverb',
        'verbModal2Adverb',
        ...COMPLEMENT_TYPES,
      ].sort(),
    );
  });

  it('leaves out the legacy slot the terminus replaced', () => {
    expect(CONCEPT_BASE_KEYS.has(LEGACY_INDIRECT)).toBe(false);
    expect(CONCEPT_BASE_KEYS.has('terminus')).toBe(true);
  });
});

describe('SLOT_KEYED_MAPS', () => {
  it('names the selection maps keyed by slot', () => {
    expect([...SLOT_KEYED_MAPS].sort()).toEqual(['adjectiveDegrees', 'modifierNumbers', 'modifierRelations']);
  });
});
