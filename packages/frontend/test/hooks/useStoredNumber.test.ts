import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useStoredNumber } from '../../src/components/PhraseBuilder/hooks/useStoredNumber.ts';

describe('useStoredNumber', () => {
  it('starts from the fallback while nothing is saved', () => {
    const { result } = renderHook(() => useStoredNumber('signi:test', 160));

    expect(result.current[0]).toBe(160);
  });

  it('starts from the saved value', () => {
    localStorage.setItem('signi:test', '240');
    const { result } = renderHook(() => useStoredNumber('signi:test', 160));

    expect(result.current[0]).toBe(240);
  });

  it.each(['wide', '', 'NaN', 'Infinity'])('starts from the fallback when the saved value is %j, not a number', (saved) => {
    localStorage.setItem('signi:test', saved);
    const { result } = renderHook(() => useStoredNumber('signi:test', 300, 150));

    expect(result.current[0]).toBe(300);
  });

  it('raises a saved value below the minimum to it', () => {
    localStorage.setItem('signi:test', '90');
    const { result } = renderHook(() => useStoredNumber('signi:test', 300, 150));

    expect(result.current[0]).toBe(150);
  });

  it('reads the store once, then holds whatever it is set to', () => {
    const { result, rerender } = renderHook(() => useStoredNumber('signi:test', 160));

    localStorage.setItem('signi:test', '240');
    rerender();
    expect(result.current[0]).toBe(160);

    act(() => result.current[1](200));
    expect(result.current[0]).toBe(200);
    // Setting it saves nothing: the caller saves when it chooses to.
    expect(localStorage.getItem('signi:test')).toBe('240');
  });
});
