import { describe, expect, it } from 'vitest';
import { migrateKeys } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/migrateKeys.ts';

describe('migrateKeys', () => {
  it('renames the legacy keys of a map and keeps its values', () => {
    expect(migrateKeys({ indirectObjectAdjective: 'purpose', subjectAdjective: 'material' })).toEqual({
      terminusAdjective: 'purpose',
      subjectAdjective: 'material',
    });
  });

  it('maps an empty map to an empty map', () => {
    expect(migrateKeys({})).toEqual({});
  });
});
