import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import { slotKindFor } from '../../src/components/PhraseBuilder/functions/slotKindFor.ts';

const CAT: Concept = { id: 'CAT', role: 'noun', description: 'CAT', label: 'cat' };
const HE: Concept = { id: 'HE', role: 'pronoun', description: 'HE', label: 'he' };
const BIG: Concept = { id: 'BIG', role: 'adjective', description: 'BIG', label: 'big' };

describe('slotKindFor', () => {
  it('offers no category on a single-vocabulary slot', () => {
    expect(slotKindFor('verb', { verb: 'noun' }, {})).toBe('');
  });

  it('opens an empty switchable slot on its default', () => {
    expect(slotKindFor('subject', {}, {})).toBe('noun');
    expect(slotKindFor('subjectAdjective', {}, {})).toBe('adjective');
  });

  it('opens a filled slot on its word’s own class', () => {
    expect(slotKindFor('subject', {}, { subject: HE })).toBe('pronoun');
    expect(slotKindFor('predicative', {}, { predicative: BIG })).toBe('adjective');
  });

  it('ignores a word whose class the slot does not offer', () => {
    expect(slotKindFor('cause', {}, { cause: BIG })).toBe('noun');
  });

  it('keeps the category the user chose over the word held', () => {
    expect(slotKindFor('subject', { subject: 'noun' }, { subject: HE })).toBe('noun');
    expect(slotKindFor('subject', { directObject: 'pronoun' }, { subject: CAT })).toBe('noun');
  });
});
