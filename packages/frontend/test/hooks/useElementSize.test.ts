import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useElementSize } from '../../src/components/PhraseBuilder/hooks/useElementSize.ts';
import { FakeResizeObserver, placed } from './dom.ts';

const INITIAL = { w: 600, h: 340 };

function renderSize(ref: { current: HTMLElement | null }, remountKey: unknown = 'first') {
  return renderHook(({ key }) => useElementSize(ref, INITIAL, key), {
    initialProps: { key: remountKey },
  });
}

describe('useElementSize', () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('holds the initial size while there is no element to measure', () => {
    const { result } = renderSize({ current: null });

    expect(result.current).toEqual(INITIAL);
    expect(FakeResizeObserver.instances).toHaveLength(0);
  });

  it('measures the element before the first paint', () => {
    const el = placed(0, 0, 320, 180);
    const { result } = renderSize({ current: el });

    expect(result.current).toEqual({ w: 320, h: 180 });
    expect(FakeResizeObserver.instances[0].observed).toEqual([el]);
  });

  it('follows the element as it resizes', () => {
    const { result } = renderSize({ current: placed(0, 0, 320, 180) });

    act(() => FakeResizeObserver.instances[0].fire(500, 250));

    expect(result.current).toEqual({ w: 500, h: 250 });
  });

  it('attaches to an element that mounts later once the remount key changes', () => {
    const ref: { current: HTMLElement | null } = { current: null };
    const { result, rerender } = renderSize(ref, false);

    const el = placed(0, 0, 320, 180);
    ref.current = el;
    rerender({ key: true });

    expect(result.current).toEqual({ w: 320, h: 180 });
    expect(FakeResizeObserver.instances).toHaveLength(1);
    expect(FakeResizeObserver.instances[0].observed).toEqual([el]);
  });

  it('lets go of the old element when it is swapped for a new one', () => {
    const ref: { current: HTMLElement | null } = { current: placed(0, 0, 320, 180) };
    const { result, rerender } = renderSize(ref, 1);

    ref.current = placed(0, 0, 640, 360);
    rerender({ key: 2 });

    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
    expect(FakeResizeObserver.instances[1].observed).toEqual([ref.current]);
    expect(result.current).toEqual({ w: 640, h: 360 });
  });

  it('stops observing on unmount', () => {
    const { unmount } = renderSize({ current: placed(0, 0, 320, 180) });

    unmount();

    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
  });
});
