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
      result.current.reportRings('subject+1', { 'subject+1': ring(80) });
      result.current.reportRings('subject/possessor', { 'subject/possessor': ring(60) });
    });

    expect(result.current.hostedRings).toEqual({ 'subject+1': ring(80), 'subject/possessor': ring(60) });
  });

  it('keeps the same object when a report changes nothing, so the canvas does not re-render', () => {
    const { result } = renderHook(() => useHostedRings());
    act(() => result.current.reportRings('subject+1', { 'subject+1': ring(80) }));
    const rings = result.current.hostedRings;

    act(() => {
      result.current.reportRings('subject+1', { 'subject+1': { ...ring(80), rOut: 80.3 } });
      result.current.reportRings('subject+2', null);
    });

    expect(result.current.hostedRings).toBe(rings);
  });

  it('drops a ring its builder reports gone', () => {
    const { result } = renderHook(() => useHostedRings());
    act(() => {
      result.current.reportRings('subject+1', { 'subject+1': ring(80) });
      result.current.reportRings('subject+2', { 'subject+2': ring(70) });
    });

    act(() => result.current.reportRings('subject+1', null));

    expect(result.current.hostedRings).toEqual({ 'subject+2': ring(70) });
  });

  it('hands out one report callback for the life of the canvas', () => {
    const { result, rerender } = renderHook(() => useHostedRings());
    const { reportRings } = result.current;

    act(() => reportRings('subject+1', { 'subject+1': ring(80) }));
    rerender();

    expect(result.current.reportRings).toBe(reportRings);
  });

  // P12-E1: one builder may draw several rings, and a ring it stops drawing leaves with its next report.
  it('holds a builder’s group, and drops the ring it no longer draws', () => {
    const { result } = renderHook(() => useHostedRings());
    act(() => result.current.reportRings('inst', { 'inst|verb': ring(80), 'inst|directObject': ring(70) }));
    expect(result.current.hostedRings).toEqual({ 'inst|verb': ring(80), 'inst|directObject': ring(70) });

    act(() => result.current.reportRings('inst', { 'inst|subject': ring(60) }));
    expect(result.current.hostedRings).toEqual({ 'inst|subject': ring(60) });

    act(() => result.current.reportRings('inst', null));
    expect(result.current.hostedRings).toEqual({});
  });
});
