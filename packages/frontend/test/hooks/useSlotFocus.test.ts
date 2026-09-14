import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { Concept } from '@signi/shared';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import { useSlotFocus } from '../../src/components/PhraseBuilder/hooks/useSlotFocus.ts';

const HE: Concept = { id: 'HE', role: 'pronoun', description: 'HE', label: 'he' };

const renderFocus = (selection: PhraseSelection = {}) =>
  renderHook(({ selection }) => useSlotFocus(selection), { initialProps: { selection } });

describe('useSlotFocus', () => {
  it('starts on the subject, with nothing open for re-picking', () => {
    const { result } = renderFocus();

    expect(result.current.activeSlot).toBe('subject');
    expect(result.current.editingSlot).toBeNull();
  });

  it('selects a slot, and opens a filled one for re-picking', () => {
    const { result } = renderFocus();

    act(() => result.current.selectSlot('verb'));
    expect(result.current).toMatchObject({ activeSlot: 'verb', editingSlot: null });

    act(() => result.current.editSlot('directObject'));
    expect(result.current).toMatchObject({ activeSlot: 'directObject', editingSlot: 'directObject' });
  });

  it('closes the re-pick only for the box that lost focus', () => {
    const { result } = renderFocus();
    act(() => result.current.editSlot('directObject'));

    act(() => result.current.cancelEdit('subject'));
    expect(result.current.editingSlot).toBe('directObject');

    act(() => result.current.cancelEdit('directObject'));
    expect(result.current.editingSlot).toBeNull();
    expect(result.current.activeSlot).toBe('directObject');
  });

  it('offers each switchable box the category chosen, else its word’s', () => {
    const { result, rerender } = renderFocus();
    expect(result.current.slotKind('subject')).toBe('noun');

    rerender({ selection: { subject: HE } });
    expect(result.current.slotKind('subject')).toBe('pronoun');

    act(() => result.current.setSlotKind('subject', 'noun'));
    expect(result.current.slotKind('subject')).toBe('noun');
    expect(result.current.slotKind('cause')).toBe('noun');
  });
});
