import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useHostedRings } from '../../src/components/PhraseBuilder/hooks/useHostedRings.ts';
import type { HostedRing } from '../../src/components/PhraseBuilder/conjunctChain.ts';

const ring = (rOut: number): HostedRing => ({ rIn: rOut - 30, orbit: rOut - 20, rOut, ports: { p: { x: 1, y: 2 } } });

describe('useHostedRings', () => {
  it('holds each builder’s report under its key', () => {
    const { result } = renderHook(() => useHostedRings());
    expect(result.current.hostedRings).toEqual({});

    act(() => {
      result.current.reportRing('subject+1', ring(80));
      result.current.reportRing('subject/possessor', ring(60));
    });

    expect(result.current.hostedRings).toEqual({ 'subject+1': ring(80), 'subject/possessor': ring(60) });
  });

  it('keeps the same object when a report changes nothing, so the canvas does not re-render', () => {
    const { result } = renderHook(() => useHostedRings());
    act(() => result.current.reportRing('subject+1', ring(80)));
    const rings = result.current.hostedRings;

    act(() => {
      result.current.reportRing('subject+1', { ...ring(80), rOut: 80.3 });
      result.current.reportRing('subject+2', null);
    });

    expect(result.current.hostedRings).toBe(rings);
  });

  it('drops a ring its builder reports gone', () => {
    const { result } = renderHook(() => useHostedRings());
    act(() => {
      result.current.reportRing('subject+1', ring(80));
      result.current.reportRing('subject+2', ring(70));
    });

    act(() => result.current.reportRing('subject+1', null));

    expect(result.current.hostedRings).toEqual({ 'subject+2': ring(70) });
  });

  it('hands out one report callback for the life of the canvas', () => {
    const { result, rerender } = renderHook(() => useHostedRings());
    const { reportRing } = result.current;

    act(() => reportRing('subject+1', ring(80)));
    rerender();

    expect(result.current.reportRing).toBe(reportRing);
  });
});
