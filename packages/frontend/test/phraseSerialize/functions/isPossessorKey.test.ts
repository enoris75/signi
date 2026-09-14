import { describe, expect, it } from 'vitest';
import { isPossessorKey } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/isPossessorKey.ts';

describe('isPossessorKey', () => {
  it.each(['subjectPossessor', 'mannerPossessor', 'indirectObjectPossessor'])('nests a selection under %s', (key) => {
    expect(isPossessorKey(key)).toBe(true);
  });

  it.each(['subjectPossessorRef', 'subject', 'subjectConjuncts'])('nests none under %s', (key) => {
    expect(isPossessorKey(key)).toBe(false);
  });
});
