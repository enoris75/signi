import { describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useOwnersOpen } from '../../src/components/PhraseBuilder/hooks/useOwnersOpen.ts';

describe('useOwnersOpen', () => {
  it('holds a period’s own open owners', () => {
    const { result } = renderHook(() => useOwnersOpen(undefined));
    expect(result.current.ownersOpen).toEqual({});

    act(() => {
      result.current.setOwnerOpen('subject', true);
      result.current.setOwnerOpen('directObject/possessor', false);
    });

    expect(result.current.ownersOpen).toEqual({ subject: true, 'directObject/possessor': false });
  });

  it('keeps the same record when an owner is set as it already is', () => {
    const { result } = renderHook(() => useOwnersOpen(undefined));
    act(() => result.current.setOwnerOpen('subject', true));
    const { ownersOpen, setOwnerOpen } = result.current;

    act(() => setOwnerOpen('subject', true));

    expect(result.current.ownersOpen).toBe(ownersOpen);
    expect(result.current.setOwnerOpen).toBe(setOwnerOpen);
  });

  it('uses its host’s open owners on a hosted ring', () => {
    const host = { ownersOpen: { subject: true }, setOwnerOpen: vi.fn() };
    const { result } = renderHook(() => useOwnersOpen(host));

    result.current.setOwnerOpen('subject', false);

    expect(result.current.ownersOpen).toBe(host.ownersOpen);
    expect(host.setOwnerOpen).toHaveBeenCalledExactlyOnceWith('subject', false);
  });
});
