import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useCornerOverlap } from '../../src/components/PhraseBuilder/hooks/useCornerOverlap.ts';
import { FakeResizeObserver, place, placed } from './dom.ts';

// A 600×200 canvas at (100, 50): its top-right corner is (700, 50).
const canvasAt = () => placed(100, 50, 600, 200);

function renderOverlap(
  overlay: HTMLElement | null,
  canvas: HTMLElement | null,
  { active = true, remountKey = 'first' as unknown } = {},
) {
  const overlayRef = { current: overlay };
  const canvasRef = { current: canvas };
  const hook = renderHook(
    ({ active, remountKey }) => useCornerOverlap(overlayRef, canvasRef, active, remountKey),
    { initialProps: { active, remountKey } },
  );
  return { ...hook, overlayRef, canvasRef };
}

describe('useCornerOverlap', () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('measures how far the overlay reaches in from the right edge and down from the top', () => {
    // 90 px wide, its right edge 4 px past the canvas's, its bottom 17 px below the canvas's top.
    const { result } = renderOverlap(placed(614, 48, 90, 19), canvasAt());

    expect(result.current).toEqual({ w: 86, h: 17 });
  });

  it('reads nothing when the overlay clears the canvas', () => {
    // Wholly above the canvas.
    expect(renderOverlap(placed(614, 20, 90, 19), canvasAt()).result.current).toEqual({ w: 0, h: 0 });
    // Wholly right of it.
    expect(renderOverlap(placed(710, 48, 90, 19), canvasAt()).result.current).toEqual({ w: 0, h: 0 });
  });

  it('measures nothing while inactive, and no element means nothing to measure', () => {
    expect(renderOverlap(placed(614, 48, 90, 19), canvasAt(), { active: false }).result.current).toEqual({
      w: 0,
      h: 0,
    });
    expect(renderOverlap(null, canvasAt()).result.current).toEqual({ w: 0, h: 0 });
    expect(FakeResizeObserver.instances).toHaveLength(0);
  });

  it('measures again when either element resizes', () => {
    const overlay = placed(614, 48, 90, 19);
    const canvas = canvasAt();
    const { result } = renderOverlap(overlay, canvas);
    expect(FakeResizeObserver.instances[0].observed).toEqual([overlay, canvas]);

    // The overlay gains two buttons, growing leftward from its pinned right edge.
    place(overlay, 576, 48, 128, 19);
    act(() => FakeResizeObserver.instances[0].fire(128, 19));

    expect(result.current).toEqual({ w: 124, h: 17 });
  });

  it('starts measuring when it turns active, and stops observing on unmount', () => {
    const { result, rerender, unmount } = renderOverlap(placed(614, 48, 90, 19), canvasAt(), {
      active: false,
    });

    rerender({ active: true, remountKey: 'first' });
    expect(result.current).toEqual({ w: 86, h: 17 });

    unmount();
    expect(FakeResizeObserver.instances[0].disconnected).toBe(true);
  });
});
