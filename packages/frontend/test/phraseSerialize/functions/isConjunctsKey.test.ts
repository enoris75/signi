import { describe, expect, it } from 'vitest';
import { isConjunctsKey } from '../../../src/components/PhraseBuilder/phraseSerialize/functions/isConjunctsKey.ts';

describe('isConjunctsKey', () => {
  it.each(['subjectConjuncts', 'predicativeConjuncts'])('lists selections under %s', (key) => {
    expect(isConjunctsKey(key)).toBe(true);
  });

  it.each(['subjectConjunction', 'subjectPossessor', 'subject'])('lists none under %s', (key) => {
    expect(isConjunctsKey(key)).toBe(false);
  });
});
