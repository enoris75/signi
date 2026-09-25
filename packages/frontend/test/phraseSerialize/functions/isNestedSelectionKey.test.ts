import { describe, expect, it } from 'vitest';
import { isNestedSelectionKey } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/isNestedSelectionKey.ts';

describe('isNestedSelectionKey', () => {
  it.each(['subjectPossessor', 'mannerPossessor', 'indirectObjectPossessor', 'predicativeStandard', 'subjectExamples'])('nests a selection under %s', (key) => {
    expect(isNestedSelectionKey(key)).toBe(true);
  });

  it.each(['subjectPossessorRef', 'subject', 'subjectConjuncts', 'predicative'])('nests none under %s', (key) => {
    expect(isNestedSelectionKey(key)).toBe(false);
  });
});
