import { describe, expect, it } from 'vitest';
import { useState } from 'react';
import { renderHook } from '@testing-library/react';
import { useHeightRebase } from '../../src/components/PhraseBuilder/hooks/useHeightRebase.ts';
import type { DragState, Positions } from '../../src/components/PhraseBuilder/hooks/useDrag.ts';

function useCanvas(graphHeight: number, dragRef: { current: DragState | null }) {
  const [positions, setPositions] = useState<Positions>({
    subject: { x: 30, y: 40 },
    verb: { x: 70, y: 90 },
  });
  const positionsStaleRef = useHeightRebase({ graphHeight, setPositions, dragRef });
  return { positions, positionsStaleRef };
}

function renderCanvas(dragRef: { current: DragState | null } = { current: null }) {
  return renderHook(({ height }) => useCanvas(height, dragRef), {
    initialProps: { height: 200 },
  });
}

describe('useHeightRebase', () => {
  it('leaves positions alone on mount', () => {
    const { result } = renderCanvas();

    expect(result.current.positions.subject).toEqual({ x: 30, y: 40 });
    expect(result.current.positionsStaleRef.current).toBe(false);
  });

  it('rebases every y onto a new height, so each node keeps its pixel offset from the top', () => {
    const { result, rerender } = renderCanvas();

    // 40% of 200 px is 80 px, which is 20% of 400 px.
    rerender({ height: 400 });

    expect(result.current.positions.subject).toEqual({ x: 30, y: 20 });
    expect(result.current.positions.verb).toEqual({ x: 70, y: 45 });
  });

  it('pins a node a shrink would push off the bottom to the 1..99 band', () => {
    const { result, rerender } = renderCanvas();

    // verb sits at 180 px, below a 100 px canvas.
    rerender({ height: 100 });

    expect(result.current.positions.verb).toEqual({ x: 70, y: 99 });
  });

  it('flags the commit that sees the new height as stale, and only that height change', () => {
    const { result, rerender } = renderCanvas();

    rerender({ height: 400 });
    expect(result.current.positionsStaleRef.current).toBe(true);

    // The overlap resolver clears it; a re-render at the same height must not raise it again.
    result.current.positionsStaleRef.current = false;
    rerender({ height: 400 });
    expect(result.current.positionsStaleRef.current).toBe(false);
  });

  it('rebases the start positions of a drag in flight too', () => {
    const dragRef = {
      current: {
        keys: ['subject'],
        startX: 0,
        startY: 0,
        origPositions: { subject: { x: 30, y: 40 } },
        moved: true,
      },
    };
    const { rerender } = renderCanvas(dragRef);

    rerender({ height: 400 });

    expect(dragRef.current.origPositions.subject).toEqual({ x: 30, y: 20 });
  });
});
