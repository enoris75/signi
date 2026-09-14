import { describe, expect, it } from 'vitest';
import { migrateKey } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/migrateKey.ts';

describe('migrateKey', () => {
  it.each([
    ['indirectObject', 'terminus'],
    ['indirectObjectAdjective2', 'terminusAdjective2'],
    ['indirectObjectPossessor', 'terminusPossessor'],
    ['indirectObject/possessor', 'terminus/possessor'],
  ])('renames the legacy %s to %s', (key, migrated) => {
    expect(migrateKey(key)).toBe(migrated);
  });

  it.each([['terminus'], ['directObject'], ['subjectAdjective'], ['modifierRelations'], ['']])(
    'keeps %j as it is',
    (key) => {
      expect(migrateKey(key)).toBe(key);
    },
  );
});
