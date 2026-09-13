import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBoxSizes } from '../../src/components/PhraseBuilder/hooks/useBoxSizes.ts';
import { DEFAULT_NODE_SIZE } from '../../src/components/PhraseBuilder/graph.ts';
import { place, placed } from './dom.ts';

// Word boxes register into `slotEls` from their ref callbacks, and are measured on the commit
// after; a `rerender` stands in for that commit.
describe('useBoxSizes', () => {
  it('reads a box nobody has measured yet as the nominal box', () => {
    const { result } = renderHook(() => useBoxSizes());

    expect(result.current.boxSizes).toEqual({});
    expect(result.current.sizeOf('subject')).toEqual(DEFAULT_NODE_SIZE);
  });

  it('measures every registered box on the next commit', () => {
    const { result, rerender } = renderHook(() => useBoxSizes());

    result.current.slotEls.current.set('subject', placed(10, 10, 140, 48));
    result.current.slotEls.current.set('verb', placed(300, 10, 96, 52));
    rerender();

    expect(result.current.boxSizes).toEqual({
      subject: { w: 140, h: 48 },
      verb: { w: 96, h: 52 },
    });
    expect(result.current.sizeOf('subject')).toEqual({ w: 140, h: 48 });
    expect(result.current.sizeOf('directObject')).toEqual(DEFAULT_NODE_SIZE);
  });

  it('forgets a box that unregistered', () => {
    const { result, rerender } = renderHook(() => useBoxSizes());
    result.current.slotEls.current.set('subject', placed(0, 0, 140, 48));
    rerender();

    result.current.slotEls.current.delete('subject');
    rerender();

    expect(result.current.boxSizes).toEqual({});
  });

  it('keeps the same sizes object through sub-pixel jitter, so the effect settles', () => {
    const { result, rerender } = renderHook(() => useBoxSizes());
    const box = placed(0, 0, 140, 48);
    result.current.slotEls.current.set('subject', box);
    rerender();
    const settled = result.current.boxSizes;

    place(box, 0, 0, 140.4, 47.7);
    rerender();
    expect(result.current.boxSizes).toBe(settled);

    place(box, 0, 0, 180, 48);
    rerender();
    expect(result.current.boxSizes).not.toBe(settled);
    expect(result.current.boxSizes.subject).toEqual({ w: 180, h: 48 });
  });
});
