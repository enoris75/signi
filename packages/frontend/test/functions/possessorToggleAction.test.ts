import { describe, expect, it } from 'vitest';
import type { Concept } from '@signi/shared';
import { possessorToggleAction } from '../../src/components/PhraseBuilder/functions/possessorToggleAction.ts';

const BOY: Concept = { id: 'BOY', role: 'noun', description: 'BOY', label: 'boy' };
const HORSE: Concept = { id: 'HORSE', role: 'noun', description: 'HORSE', label: 'horse' };

describe('possessorToggleAction', () => {
  it('takes away an owner the noun points to, however it was left', () => {
    const pointing = { subject: BOY, directObject: HORSE, directObjectPossessorRef: 'subject' };

    expect(possessorToggleAction(pointing, 'directObject', undefined)).toBe('remove');
    expect(possessorToggleAction(pointing, 'directObject', true)).toBe('remove');
  });

  it('opens an empty owner and offers the nouns it could point to', () => {
    expect(possessorToggleAction({ directObject: HORSE }, 'directObject', undefined)).toBe('openAndPick');
    expect(possessorToggleAction({ directObject: HORSE, directObjectPossessor: {} }, 'directObject', false)).toBe(
      'openAndPick',
    );
  });

  it('folds away an owner that is showing: a named one by default, an empty one once opened', () => {
    const named = { directObject: HORSE, directObjectPossessor: { subject: BOY } };

    expect(possessorToggleAction(named, 'directObject', undefined)).toBe('fold');
    expect(possessorToggleAction({ directObject: HORSE }, 'directObject', true)).toBe('fold');
  });

  it('opens a named owner folded away again, with nothing to pick', () => {
    const named = { directObject: HORSE, directObjectPossessor: { subject: BOY } };

    expect(possessorToggleAction(named, 'directObject', false)).toBe('open');
  });
});
