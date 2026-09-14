import { describe, expect, it } from 'vitest';
import { isConceptKey } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/isConceptKey.ts';

describe('isConceptKey', () => {
  it.each([
    'subject',
    'verb',
    'directObject',
    'modifier',
    'verbModal2',
    'verbModal2Adverb',
    'locative',
    'instrumental',
    'subjectAdjective',
    'routeAdjective2',
    'mannerAdjective3',
  ])('holds a concept under %s', (key) => {
    expect(isConceptKey(key)).toBe(true);
  });

  it.each([
    'subjectNumber',
    'verbTense',
    'subjectPossessor',
    'subjectPossessorRef',
    'subjectConjuncts',
    'modifierAdjectives',
    'modifierRelations',
    'locativeSpecifier',
    'indirectObject',
  ])('holds no concept under %s', (key) => {
    expect(isConceptKey(key)).toBe(false);
  });
});
